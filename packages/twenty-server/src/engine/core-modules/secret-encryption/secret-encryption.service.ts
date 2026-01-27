import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import {
  decryptText,
  encryptText,
} from 'src/engine/core-modules/auth/auth.util';
import { EnvironmentConfigDriver } from 'src/engine/core-modules/twenty-config/drivers/environment-config.driver';

@Injectable()
export class SecretEncryptionService {
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

    const appSecret = this.getAppSecret();

    return encryptText(value, appSecret);
  }

  public decrypt(value: string): string {
    if (!isDefined(value)) {
      return value;
    }

    const appSecret = this.getAppSecret();

    return decryptText(value, appSecret);
  }

  public decryptAndMask({
    value,
    mask,
  }: {
    value: string;
    mask: string;
  }): string {
    if (!isDefined(value)) {
      return value;
    }

    const decryptedValue = this.decrypt(value);

    const visibleCharsCount = Math.min(
      5,
      Math.floor(decryptedValue.length / 10),
    );

    return `${decryptedValue.slice(0, visibleCharsCount)}${mask}`;
  }
}
