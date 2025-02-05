// eslint-disable-next-line project-structure/folder-structure
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyCocwTG8hCptxofY7dFWOgDow2qKwWnZ48',
  authDomain: 'kvoip-c1988.firebaseapp.com',
  projectId: 'kvoip-c1988',
  storageBucket: 'kvoip-c1988.appspot.com',
  messagingSenderId: '879760840528',
  appId: '1:879760840528:web:3586e245356ddcd691fe55',
};

const app = initializeApp(firebaseConfig);

export const firestoreDB = getFirestore(app);
