import { Injectable } from '@nestjs/common';

import { authenticator } from 'otplib';
import { TwoFactorAuthenticationStrategy } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { type ZodSafeParseResult } from 'zod';

import { type OTPAuthenticationStrategyInterface } from 'src/engine/core-modules/two-factor-authentication/strategies/otp/interfaces/otp.strategy.interface';

import { OTPStatus } from 'src/engine/core-modules/two-factor-authentication/strategies/otp/otp.constants';
import {
  TwoFactorAuthenticationException,
  TwoFactorAuthenticationExceptionCode,
} from 'src/engine/core-modules/two-factor-authentication/two-factor-authentication.exception';

import {
  TOTP_STRATEGY_CONFIG_SCHEMA,
  type TotpContext,
  TOTPStrategyConfig,
  TOTP_DEFAULT_CONFIGURATION,
} from './constants/totp.strategy.constants';

@Injectable()
export class TotpStrategy implements OTPAuthenticationStrategyInterface {
  public readonly name = TwoFactorAuthenticationStrategy.TOTP;

  constructor(options?: TOTPStrategyConfig) {
    let result: ZodSafeParseResult<TOTPStrategyConfig> | undefined;

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

    const config = {
      ...TOTP_DEFAULT_CONFIGURATION,
      ...options,
    };

    authenticator.options = {
      window: config.window,
      step: config.step,
      digits: config.digits,
    };
  }

  public initiate(
    accountName: string,
    issuer: string,
  ): {
    uri: string;
    context: TotpContext;
  } {
    const secret = authenticator.generateSecret();
    const uri = authenticator.keyuri(accountName, issuer, secret);

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
    const isValid = authenticator.check(token, context.secret);

    return {
      isValid,
      context,
    };
  }
}
