import { Injectable } from '@nestjs/common';

import crypto from 'crypto';

import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const AUTH_TAG_LENGTH = 16;
const HKDF_CONTEXT = 'application-registration-variable';

@Injectable()
export class ApplicationRegistrationEncryptionService {
  private encryptionKey: Buffer;

  constructor(private readonly twentyConfigService: TwentyConfigService) {
    const appSecret = this.twentyConfigService.get('APP_SECRET');

    this.encryptionKey = Buffer.from(
      crypto.hkdfSync('sha256', appSecret, '', HKDF_CONTEXT, 32),
    );
  }

  encrypt(plaintext: string): string {
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(ALGORITHM, this.encryptionKey, iv, {
      authTagLength: AUTH_TAG_LENGTH,
    });

    const encrypted = Buffer.concat([
      cipher.update(plaintext, 'utf8'),
      cipher.final(),
    ]);

    const authTag = cipher.getAuthTag();

    // Format: base64(iv + authTag + ciphertext)
    return Buffer.concat([iv, authTag, encrypted]).toString('base64');
  }

  decrypt(encryptedBase64: string): string {
    if (!encryptedBase64) {
      return '';
    }

    const data = Buffer.from(encryptedBase64, 'base64');

    const iv = data.subarray(0, IV_LENGTH);
    const authTag = data.subarray(IV_LENGTH, IV_LENGTH + AUTH_TAG_LENGTH);
    const ciphertext = data.subarray(IV_LENGTH + AUTH_TAG_LENGTH);

    const decipher = crypto.createDecipheriv(
      ALGORITHM,
      this.encryptionKey,
      iv,
      { authTagLength: AUTH_TAG_LENGTH },
    );

    decipher.setAuthTag(authTag);

    return decipher.update(ciphertext) + decipher.final('utf8');
  }
}
