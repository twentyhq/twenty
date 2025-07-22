import { Injectable, Logger } from '@nestjs/common';

import { TOTP, TOTPOptions } from '@otplib/core';
import { createDigest } from '@otplib/plugin-crypto';
import { authenticator } from 'otplib';
import { TwoFactorAuthenticationStrategy } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { SafeParseReturnType } from 'zod';

import { OTPAuthenticationStrategyInterface } from 'src/engine/core-modules/two-factor-authentication/strategies/otp/interfaces/otp.strategy.interface';

import { OTPStatus } from 'src/engine/core-modules/two-factor-authentication/strategies/otp/otp.constants';
import {
  TwoFactorAuthenticationException,
  TwoFactorAuthenticationExceptionCode,
} from 'src/engine/core-modules/two-factor-authentication/two-factor-authentication.exception';

import {
  TOTP_STRATEGY_CONFIG_SCHEMA,
  TotpContext,
  TOTPStrategyConfig,
} from './constants/totp.strategy.constants';

@Injectable()
export class TotpStrategy implements OTPAuthenticationStrategyInterface {
  public readonly name = TwoFactorAuthenticationStrategy.TOTP;

  private readonly logger = new Logger(TotpStrategy.name);
  private readonly totp: TOTP<TOTPOptions<string>>;

  constructor(options?: TOTPStrategyConfig) {
    let result: SafeParseReturnType<unknown, TOTPStrategyConfig> | undefined;

    if (isDefined(options)) {
      result = TOTP_STRATEGY_CONFIG_SCHEMA.safeParse(options);

      if (!result.success) {
        const errorMessages = Object.entries(result.error.flatten().fieldErrors)
          .map(
            ([key, messages]: [key: string, messages: string[]]) =>
              `${key}: ${messages.join(', ')}`,
          )
          .join('; ');

        throw new TwoFactorAuthenticationException(
          `Invalid TOTP configuration: ${errorMessages}`,
          TwoFactorAuthenticationExceptionCode.INVALID_CONFIGURATION,
        );
      }

      if (result.data.encodings && result.data.encodings !== 'hex') {
        this.logger.warn(
          '⚠️ TOTP Strategy Warning: For best compatibility, the recommended secret encoding is "hex".',
        );
      }

      if (result.data.algorithm && result.data.algorithm !== 'sha1') {
        this.logger.warn(
          '⚠️ TOTP Strategy Warning: While other algorithms are supported, "sha1" is the most common standard for TOTP compatibility.',
        );
      }
    }

    const config = {
      ...result?.data,
      createDigest,
    } as Partial<TOTPOptions<string>>;

    this.totp = new TOTP(config);
  }

  public initiate(
    accountName: string,
    issuer: string,
  ): {
    uri: string;
    context: TotpContext;
  } {
    const secret = authenticator.generateSecret();
    const uri = this.totp.keyuri(accountName, issuer, secret);

    return {
      uri,
      context: {
        status: OTPStatus.PENDING,
        secret,
      },
    };
  }

  public validate(
    token: string,
    context: TotpContext,
  ): {
    isValid: boolean;
    context: TotpContext;
  } {
    const isValid = this.totp.check(token, context.secret);

    return {
      isValid,
      context,
    };
  }
}
