import { Injectable } from '@nestjs/common';
import { FirebaseApp, initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

import { EnvironmentService } from 'src/engine/core-modules/environment/environment.service';

@Injectable()
export class FirebaseService {
  private app: FirebaseApp;

  constructor(private readonly environmentService: EnvironmentService) {
    this.app = initializeApp({
      apiKey: this.environmentService.get('FIREBASE_API_KEY'),
      authDomain: this.environmentService.get('FIREBASE_AUTH_DOMAIN'),
      projectId: this.environmentService.get('FIREBASE_PROJECT_ID'),
      storageBucket: this.environmentService.get('FIREBASE_STORAGE_BUCKET'),
      messagingSenderId: this.environmentService.get(
        'FIREBASE_MESSAGING_SENDER_ID',
      ),
      appId: this.environmentService.get('FIREBASE_APP_ID'),
    });
  }

  getFirestoreDb() {
    return getFirestore(this.app);
  }
}
