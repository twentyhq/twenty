import { authenticator } from 'otplib';
import { HashAlgorithms, HOTP, HOTPOptions, KeyEncodings } from '@otplib/core';
import { SafeParseReturnType, z } from 'zod';
import { Injectable, Logger } from '@nestjs/common';
import { ITwoFactorAuthStrategy } from '../interfaces/two-factor-authentication.interface';
import { TwoFactorAuthenticationException, TwoFactorAuthenticationExceptionCode } from '../two-factor-authentication.exception';
import { HotpContext, OTPHashAlgorithms, OTPKeyEncodings } from '../two-factor-authentication.interface';
import { isDefined } from 'twenty-shared/utils';
import { createDigest } from '@otplib/plugin-crypto'
import { TwoFactorAuthenticationStrategy } from 'twenty-shared/types';

export type HOTPStrategyConfig = z.infer<typeof HOTPStrategyConfigSchema>;

export const HOTPStrategyConfigSchema = z.object({
  algorithm: z.nativeEnum(OTPHashAlgorithms, {
    errorMap: () => ({ message: 'Invalid algorithm specified. Must be SHA1, SHA256, or SHA512.' })
  }).optional(),
  digits: z.number({
    invalid_type_error: 'Digits must be a number.'
  })
    .int({ message: 'Digits must be a whole number.' })
    .min(6, { message: 'Digits must be at least 6.' })
    .max(8, { message: 'Digits cannot be more than 8.' })
    .optional(),
  encodings: z.nativeEnum(OTPKeyEncodings, {
    errorMap: () => ({ message: 'Invalid encoding specified.' })
  }).optional(),
  window: z.number().int().min(0).optional()
});

@Injectable()
export class HotpStrategy implements ITwoFactorAuthStrategy {
  public readonly name = TwoFactorAuthenticationStrategy.HOTP;

  private readonly logger = new Logger(HotpStrategy.name);
  private readonly hotp: HOTP<HOTPOptions<string>>;
  private readonly window: number;

  constructor(options?: HOTPStrategyConfig ) {
    let result: SafeParseReturnType<unknown, HOTPStrategyConfig> | undefined;

    if (isDefined(options)) {
      result = HOTPStrategyConfigSchema.safeParse(options);

      if (!result.success) {
        const errorMessages = Object.entries(result.error.flatten().fieldErrors)
          .map(([key, messages]: [key: string, messages: string[]]) => 
            `${key}: ${messages.join(', ')}`
          )
          .join('; ');

        throw new TwoFactorAuthenticationException(
          `Invalid HOTP configuration: ${errorMessages}`,
          TwoFactorAuthenticationExceptionCode.INVALID_CONFIGURATION,
        );
      }

      if (result.data.encodings && result.data.encodings !== 'hex') {
        this.logger.warn(
          '⚠️ HOTP Strategy Warning: For best compatibility with apps like Google Authenticator, the recommended secret encoding is "hex".',
        );
      }

      if (result.data.algorithm && result.data.algorithm !== 'sha1') {
        this.logger.warn(
          '⚠️ HOTP Strategy Warning: While other algorithms are supported, "sha1" is the most common standard for HOTP compatibility.',
        );
      }
    }


    const config: Partial<HOTPOptions<string>> = {
      ...result?.data,
      algorithm: result?.data?.algorithm as HashAlgorithms | undefined,
      createDigest
    };

    this.hotp = new HOTP(config);
    this.window = result?.data?.window ?? 0;
  }

  public initiate(
    accountName: string,
    issuer: string,
    counter: number
  ): {
    uri: string,
    context: HotpContext
  } {
    const secret = authenticator.generateSecret();
    const uri = this.hotp.keyuri(
      accountName,
      issuer,
      secret,
      counter
    )

    return {
      uri,
      context: {
        strategy: this.name,
        status: 'PENDING',
        counter,
        secret
      }
    }
  }

  public validate(
    token: string, 
    context: HotpContext
  ): {
    isValid: boolean,
    context: HotpContext
  } {
    const isValidAtCurrentCounter = this.hotp.check(
      token, 
      context.secret, 
      context.counter
    );

    if (isValidAtCurrentCounter) {
      return {
        isValid: true,
        context: this.incrementCounter(context)
      }
    }

    if (this.window > 0) {
      return this._resynchronize(token, context);
    }

    return {
      isValid: false,
      context
    }
  }

  private _resynchronize(
    token: string,
    context: HotpContext
  ): {
    isValid: boolean,
    context: HotpContext
  } {
    this.logger.log(`OTP at counter ${context.counter} is invalid. Checking within a window of ${this.window}.`);

    for (let i = 1; i <= this.window; i++) {
      const tempCounter = context.counter + i;
      const isValidAtTempCounter = this.hotp.check(
        token,
        context.secret,
        tempCounter
      );

      if (isValidAtTempCounter) {
        this.logger.log(`OTP is valid at future counter ${tempCounter}. Resynchronizing.`);
        return {
          isValid: true,
          context: this.incrementCounter({
            ...context,
            counter: tempCounter
          })
        };
      }
    }

    return {
      isValid: false,
      context
    }
  }

  private incrementCounter(
    context: HotpContext
  ): HotpContext {

    return {
      ...context,
      counter: context.counter + 1
    }
  }
}