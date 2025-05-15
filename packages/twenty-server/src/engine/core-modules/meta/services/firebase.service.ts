import { Injectable } from '@nestjs/common';

import { FirebaseApp, initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';

@Injectable()
export class FirebaseService {
  private app: FirebaseApp;

  constructor(private readonly twentyConfigService: TwentyConfigService) {
    this.app = initializeApp({
      apiKey: this.twentyConfigService.get('FIREBASE_API_KEY'),
      authDomain: this.twentyConfigService.get('FIREBASE_AUTH_DOMAIN'),
      projectId: this.twentyConfigService.get('FIREBASE_PROJECT_ID'),
      storageBucket: this.twentyConfigService.get('FIREBASE_STORAGE_BUCKET'),
      messagingSenderId: this.twentyConfigService.get(
        'FIREBASE_MESSAGING_SENDER_ID',
      ),
      appId: this.twentyConfigService.get('FIREBASE_APP_ID'),
    });
  }

  getFirestoreDb() {
    return getFirestore(this.app);
  }
}
