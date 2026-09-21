import { Injectable } from '@nestjs/common';

import { authenticator } from 'otplib';
import { TwoFactorAuthenticationStrategy } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { type OTPAuthenticationStrategyInterface } from 'src/engine/core-modules/two-factor-authentication/strategies/otp/interfaces/otp.strategy.interface';
import { type PlaintextString } from 'src/engine/core-modules/secret-encryption/branded-strings/plaintext-string.type';

import { OTPStatus } from 'src/engine/core-modules/two-factor-authentication/strategies/otp/otp.constants';
import {
  TwoFactorAuthenticationException,
  TwoFactorAuthenticationExceptionCode,
} from 'src/engine/core-modules/two-factor-authentication/two-factor-authentication.exception';

import {
  TOTP_STRATEGY_CONFIG_SCHEMA,
  type TotpContext,
  TOTPStrategyConfig,
} from './constants/totp.strategy.constants';

type TotpAuthenticator = typeof authenticator;
type TotpAuthenticatorOptions = NonNullable<
  Parameters<TotpAuthenticator['clone']>[0]
>;

@Injectable()
export class TotpStrategy implements OTPAuthenticationStrategyInterface {
  public readonly name = TwoFactorAuthenticationStrategy.TOTP;

  private readonly totpAuthenticator: TotpAuthenticator;

  constructor(options?: TOTPStrategyConfig) {
    let validatedOptions: TOTPStrategyConfig | undefined;

    if (isDefined(options)) {
      const result = TOTP_STRATEGY_CONFIG_SCHEMA.safeParse(options);

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

      validatedOptions = result.data;
    }

    this.totpAuthenticator = authenticator.clone(
      this.buildAuthenticatorOptions(validatedOptions),
    );
  }

  private buildAuthenticatorOptions(
    config?: TOTPStrategyConfig,
  ): TotpAuthenticatorOptions {
    const authenticatorOptions: TotpAuthenticatorOptions = {};

    if (!isDefined(config)) {
      return authenticatorOptions;
    }

    if (isDefined(config.algorithm)) {
      authenticatorOptions.algorithm =
        config.algorithm as unknown as TotpAuthenticatorOptions['algorithm'];
    }

    if (isDefined(config.encodings)) {
      authenticatorOptions.encoding =
        config.encodings as unknown as TotpAuthenticatorOptions['encoding'];
    }

    if (isDefined(config.digits)) {
      authenticatorOptions.digits = config.digits;
    }

    if (isDefined(config.window)) {
      authenticatorOptions.window = config.window;
    }

    if (isDefined(config.step)) {
      authenticatorOptions.step = config.step;
    }

    if (isDefined(config.epoch)) {
      authenticatorOptions.epoch = config.epoch;
    }

    return authenticatorOptions;
  }

  public initiate(
    accountName: string,
    issuer: string,
  ): {
    uri: string;
    context: TotpContext;
  } {
    const secret = this.totpAuthenticator.generateSecret() as PlaintextString;
    const uri = this.totpAuthenticator.keyuri(accountName, issuer, secret);

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
    const isValid = this.totpAuthenticator.check(token, context.secret);

    return {
      isValid,
      context,
    };
  }
}
