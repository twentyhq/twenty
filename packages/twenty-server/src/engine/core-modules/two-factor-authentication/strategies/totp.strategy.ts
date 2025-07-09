import { authenticator, totp } from 'otplib';
import { HashAlgorithms, TOTP, TOTPOptions } from '@otplib/core';
import { SafeParseReturnType, z } from 'zod';
import { Injectable, Logger } from '@nestjs/common';
import { ITwoFactorAuthStrategy } from '../interfaces/two-factor-authentication.interface';
import { TwoFactorAuthenticationException, TwoFactorAuthenticationExceptionCode } from '../two-factor-authentication.exception';
import { TotpContext } from '../two-factor-authentication.interface';
import { isDefined } from 'twenty-shared/utils';
import { createDigest } from '@otplib/plugin-crypto';
import { HOTPStrategyConfigSchema } from './hotp.strategy';
import { TwoFactorAuthenticationStrategy } from 'twenty-shared/types';

export type TOTPStrategyConfig = z.infer<typeof TOTPStrategyConfigSchema>;


const TOTPStrategyConfigSchema = HOTPStrategyConfigSchema.extend({
  step: z.number({
    invalid_type_error: 'Step must be a number.'
  }).int().min(1).optional(),
  epoch: z.number().int().min(0).optional(),
});

@Injectable()
export class TotpStrategy implements ITwoFactorAuthStrategy {
  public readonly name = TwoFactorAuthenticationStrategy.TOTP;

  private readonly logger = new Logger(TotpStrategy.name);
  private readonly totp: TOTP<TOTPOptions<string>>;

  constructor(options?: TOTPStrategyConfig ) {
    let result: SafeParseReturnType<unknown, TOTPStrategyConfig> | undefined;
    if (isDefined(options)) {
      result = TOTPStrategyConfigSchema.safeParse(options);
  
      if (!result.success) {
        const errorMessages = Object.entries(result.error.flatten().fieldErrors)
          .map(([key, messages]: [key: string, messages: string[]]) => 
            `${key}: ${messages.join(', ')}`
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

    const config: Partial<TOTPOptions<string>> = {
      ...result?.data,
      algorithm: result?.data?.algorithm as HashAlgorithms | undefined,
      createDigest
    };

    this.totp = new TOTP(config);
  }

  public initiate(
    accountName: string,
    issuer: string,
  ): {
    uri: string,
    context: TotpContext
  } {
    const secret = authenticator.generateSecret();
    const uri = this.totp.keyuri(
      accountName,
      issuer,
      secret,
    )

    return {
      uri,
      context: {
        strategy: this.name,
        status: 'PENDING',
        secret,
      }
    }
  }

  public validate(
    token: string, 
    context: TotpContext
  ): {
    isValid: boolean,
    context: TotpContext
  } {
    const isValid = this.totp.check(
      token, 
      context.secret
    );

    return {
      isValid,
      context
    }
  }
}