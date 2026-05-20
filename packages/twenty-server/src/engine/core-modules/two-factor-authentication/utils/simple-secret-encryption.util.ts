import { Injectable } from '@nestjs/common';

import { createDecipheriv, createHash } from 'crypto';

import { JwtTokenTypeEnum } from 'src/engine/core-modules/auth/types/auth-context.type';
import { JwtWrapperService } from 'src/engine/core-modules/jwt/services/jwt-wrapper.service';

// TODO: delete this util once the 2.5 cross-upgrade window closes and every
// `core.twoFactorAuthenticationMethod.secret` row is known to be in the
// `enc:v2:` envelope. Also drop the call sites in TwoFactorAuthenticationService
// and the matching slow instance command, and stop providing this util in
// TwoFactorAuthenticationModule and InstanceCommandProviderModule.
/**
 * @deprecated Legacy TOTP secret decryption (AES-256-CBC keyed off
 * `APP_SECRET + userId + workspaceId + 'otp-secret' + 'KEY_ENCRYPTION_KEY'`).
 * Kept only to read pre-2.5 rows during the cross-upgrade window. New rows are
 * written by `SecretEncryptionService.encryptVersioned` (enc:v2 envelope).
 */
@Injectable()
export class SimpleSecretEncryptionUtil {
  private readonly algorithm = 'aes-256-cbc';
  private readonly keyLength = 32;

  constructor(private readonly jwtWrapperService: JwtWrapperService) {}

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
