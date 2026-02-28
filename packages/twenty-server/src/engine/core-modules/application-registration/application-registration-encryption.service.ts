import { Injectable, type OnModuleInit } from '@nestjs/common';

import { promisify } from 'util';
import crypto from 'crypto';

import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const AUTH_TAG_LENGTH = 16;
const HKDF_CONTEXT = 'application-registration-variable';

const hkdf = promisify(crypto.hkdf);

@Injectable()
export class ApplicationRegistrationEncryptionService implements OnModuleInit {
  private encryptionKey!: Buffer;

  constructor(private readonly twentyConfigService: TwentyConfigService) {}

  async onModuleInit(): Promise<void> {
    const appSecret = this.twentyConfigService.get('APP_SECRET');

    this.encryptionKey = Buffer.from(
      await hkdf('sha256', appSecret, '', HKDF_CONTEXT, 32),
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

    return Buffer.concat([iv, authTag, encrypted]).toString('base64');
  }

  decrypt(encryptedBase64: string): string {
    if (!encryptedBase64) {
      return '';
    }

    const data = Buffer.from(encryptedBase64, 'base64');

    const minLength = IV_LENGTH + AUTH_TAG_LENGTH;

    if (data.length < minLength) {
      throw new Error(
        'Encrypted data is too short — possibly corrupted or truncated',
      );
    }

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
