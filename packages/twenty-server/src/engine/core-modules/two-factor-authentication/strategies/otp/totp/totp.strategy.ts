import { Injectable, Logger } from '@nestjs/common';

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
    }

    // Note: We don't configure otplib options to avoid type issues
    // otplib will use its defaults: sha1, 6 digits, 30 second step, etc.
  }

  public initiate(
    accountName: string,
    issuer: string,
  ): {
    uri: string;
    context: TotpContext;
  } {
    // Use authenticator.generateSecret() which generates base32 encoded secrets
    const secret = authenticator.generateSecret();
    
    // Use authenticator.keyuri which handles the correct format for Google Authenticator compatibility
    const uri = authenticator.keyuri(accountName, issuer, secret);

    return {
      uri,
      context: {
        status: OTPStatus.PENDING,
        secret, // This is already base32 encoded
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
    // Use authenticator.check which is designed to work with base32 secrets
    // This should be compatible with Google Authenticator and other TOTP apps
    const isValid = authenticator.check(token, context.secret);

    return {
      isValid,
      context,
    };
  }
}
