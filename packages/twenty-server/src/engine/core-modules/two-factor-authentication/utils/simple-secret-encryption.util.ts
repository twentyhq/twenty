import { Injectable } from '@nestjs/common';

import {
  createCipheriv,
  createDecipheriv,
  createHash,
  randomBytes,
} from 'crypto';

import { JwtTokenTypeEnum } from 'src/engine/core-modules/auth/types/auth-context.type';
import { JwtWrapperService } from 'src/engine/core-modules/jwt/services/jwt-wrapper.service';

/**
 * Simplified encryption utility for TOTP secrets.
 */
@Injectable()
export class SimpleSecretEncryptionUtil {
  private readonly algorithm = 'aes-256-cbc';
  private readonly keyLength = 32;
  private readonly ivLength = 16;

  constructor(private readonly jwtWrapperService: JwtWrapperService) {}

  /**
   * Encrypts a TOTP secret string
   */
  async encryptSecret(secret: string, purpose: string): Promise<string> {
    const appSecret = this.jwtWrapperService.generateAppSecret(
      JwtTokenTypeEnum.KEY_ENCRYPTION_KEY,
      purpose,
    );

    const encryptionKey = createHash('sha256')
      .update(appSecret)
      .digest()
      .slice(0, this.keyLength);

    const iv = randomBytes(this.ivLength);

    const cipher = createCipheriv(this.algorithm, encryptionKey, iv);
    let encrypted = cipher.update(secret, 'utf8', 'hex');

    encrypted += cipher.final('hex');

    return iv.toString('hex') + ':' + encrypted;
  }

  /**
   * Decrypts a TOTP secret string
   */
  async decryptSecret(
    encryptedSecret: string,
    purpose: string,
  ): Promise<string> {
    const appSecret = this.jwtWrapperService.generateAppSecret(
      JwtTokenTypeEnum.KEY_ENCRYPTION_KEY,
      purpose,
    );

    const encryptionKey = createHash('sha256')
      .update(appSecret)
      .digest()
      .slice(0, this.keyLength);

    const [ivHex, encryptedData] = encryptedSecret.split(':');
    const iv = Buffer.from(ivHex, 'hex');

    const decipher = createDecipheriv(this.algorithm, encryptionKey, iv);
    let decrypted = decipher.update(encryptedData, 'hex', 'utf8');

    decrypted += decipher.final('utf8');

    return decrypted;
  }
}
