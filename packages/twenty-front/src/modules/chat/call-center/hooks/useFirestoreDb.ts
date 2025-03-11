import { initializeApp } from 'firebase/app';
import { Firestore, getFirestore } from 'firebase/firestore';
import z from 'zod';
import {
  REACT_APP_FIREBASE_API_KEY,
  REACT_APP_FIREBASE_APP_ID,
  REACT_APP_FIREBASE_AUTH_DOMAIN,
  REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  REACT_APP_FIREBASE_PROJECT_ID,
  REACT_APP_FIREBASE_STORAGE_BUCKET,
} from '~/config';

const firebaseCredentialsSchema = z.array(z.string()).nonempty().length(6);

export const useFirestoreDb = (): { firestoreDb: Firestore } => {
  firebaseCredentialsSchema.parse([
    REACT_APP_FIREBASE_API_KEY,
    REACT_APP_FIREBASE_AUTH_DOMAIN,
    REACT_APP_FIREBASE_PROJECT_ID,
    REACT_APP_FIREBASE_STORAGE_BUCKET,
    REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
    REACT_APP_FIREBASE_APP_ID,
  ]);

  const app = initializeApp({
    apiKey: REACT_APP_FIREBASE_API_KEY,
    authDomain: REACT_APP_FIREBASE_AUTH_DOMAIN,
    projectId: REACT_APP_FIREBASE_PROJECT_ID,
    storageBucket: REACT_APP_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
    appId: REACT_APP_FIREBASE_APP_ID,
  });

  return {
    firestoreDb: getFirestore(app),
  };
};
