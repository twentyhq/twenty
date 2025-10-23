import { Injectable, Logger } from '@nestjs/common';

import { isString } from 'class-validator';
import { isDefined } from 'twenty-shared/utils';

import {
  decryptText,
  encryptText,
} from 'src/engine/core-modules/auth/auth.util';
import { SECRET_ENCRYPTION_MASK } from 'src/engine/core-modules/secret-encryption/constants/secret-encryption-mask.constant';
import { EnvironmentConfigDriver } from 'src/engine/core-modules/twenty-config/drivers/environment-config.driver';

@Injectable()
export class SecretEncryptionService {
  private readonly logger = new Logger(SecretEncryptionService.name);

  constructor(
    private readonly environmentConfigDriver: EnvironmentConfigDriver,
  ) {}

  private getAppSecret(): string {
    return this.environmentConfigDriver.get('APP_SECRET');
  }

  public encrypt(value: string): string {
    if (!isDefined(value)) {
      return value;
    }

    try {
      const appSecret = this.getAppSecret();

      return encryptText(value, appSecret);
    } catch (error) {
      this.logger.debug(
        `Encryption failed: ${error.message}. Using original value.`,
      );

      return value;
    }
  }

  public decrypt(value: string): string {
    if (!isDefined(value)) {
      return value;
    }

    try {
      const appSecret = this.getAppSecret();

      return decryptText(value, appSecret);
    } catch (error) {
      this.logger.debug(
        `Decryption failed: ${error.message}. Using original value.`,
      );

      return value;
    }
  }

  public decryptAndMask(value: string): string {
    if (!isDefined(value)) {
      return value;
    }

    const decryptedValue = this.decrypt(value);

    if (isString(decryptedValue)) {
      if (decryptedValue.length <= SECRET_ENCRYPTION_MASK.length) {
        return SECRET_ENCRYPTION_MASK[0].repeat(decryptedValue.length);
      }

      return (
        SECRET_ENCRYPTION_MASK[0].repeat(SECRET_ENCRYPTION_MASK.length) +
        decryptedValue.slice(-SECRET_ENCRYPTION_MASK.length)
      );
    }

    return SECRET_ENCRYPTION_MASK;
  }
}
