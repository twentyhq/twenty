import { Injectable } from '@nestjs/common';

import { createDecipheriv, createHash } from 'crypto';

import { JwtTokenTypeEnum } from 'src/engine/core-modules/auth/types/jwt-token-type.enum';
import { JwtWrapperService } from 'src/engine/core-modules/jwt/services/jwt-wrapper.service';
import { type PlaintextString } from 'src/engine/core-modules/secret-encryption/branded-strings/plaintext-string.type';

// Legacy TOTP secret decryption (AES-256-CBC), used only by the 2.5
// encrypt-totp-secrets slow command to re-encrypt pre-2.5 rows into enc:v2.
@Injectable()
export class SimpleSecretEncryptionUtil {
  private readonly algorithm = 'aes-256-cbc';
  private readonly keyLength = 32;

  constructor(private readonly jwtWrapperService: JwtWrapperService) {}

  async decryptSecret(
    encryptedSecret: string,
    purpose: string,
  ): Promise<PlaintextString> {
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

    return decrypted as PlaintextString;
  }
}
