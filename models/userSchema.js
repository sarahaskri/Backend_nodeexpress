const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
    firstname: { type: String },
    lastname: { type: String },
    password: {
        type: String,
        required: true,
        minlength: 8,
        match: /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
    },
    email: {
        type: String,
        required: true,
        unique: true, // Vérifier que MongoDB applique bien l'unicité
        match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    },
    role: {
        type: String,
        enum: ["admin", "adherent"],
        required: true
    },
    age: { type: Number }, // Correction : âge devrait être un Number
    height: { type: Number },
    weight: { type: Number },
    count: { type: Number, default: 1 } // Moved inside the schema
}, { timestamps: true });
//etat : Boolean


// Middleware pour hacher le mot de passe avant l'enregistrement
userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();
    
    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
              // user.etat = false;
       
        // Trouver le dernier utilisateur pour récupérer la valeur de `count`
        const lastUser = await User.findOne().sort({ count: -1 });

        // Calcul du nouveau count
        const newCount = lastUser ? lastUser.count + 1 : 1;
        next();
    } catch (error) {
        next(error);
    }
}); 



const User = mongoose.model('User', userSchema);

// Forcer la synchronisation des index
User.syncIndexes();

module.exports = User;
