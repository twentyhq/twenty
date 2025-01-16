import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import crypto from 'crypto';

import { addMilliseconds } from 'date-fns';
import ms from 'ms';
import { Repository } from 'typeorm';

import {
  AppToken,
  AppTokenType,
} from 'src/engine/core-modules/app-token/app-token.entity';
import { AuthToken } from 'src/engine/core-modules/auth/dto/token.entity';
import {
  EmailVerificationException,
  EmailVerificationExceptionCode,
} from 'src/engine/core-modules/email-verification/email-verification.exception';
import { EnvironmentService } from 'src/engine/core-modules/environment/environment.service';

@Injectable()
export class EmailVerificationTokenService {
  constructor(
    @InjectRepository(AppToken, 'core')
    private readonly appTokenRepository: Repository<AppToken>,
    private readonly environmentService: EnvironmentService,
  ) {}

  async generateToken(userId: string, email: string): Promise<AuthToken> {
    const expiresIn = this.environmentService.get(
      'EMAIL_VERIFICATION_TOKEN_EXPIRES_IN',
    );
    const expiresAt = addMilliseconds(new Date().getTime(), ms(expiresIn));

    const plainToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto
      .createHash('sha256')
      .update(plainToken)
      .digest('hex');

    const verificationToken = this.appTokenRepository.create({
      userId,
      expiresAt,
      type: AppTokenType.EmailVerificationToken,
      value: hashedToken,
      context: { email },
    });

    await this.appTokenRepository.save(verificationToken);

    return {
      token: plainToken,
      expiresAt,
    };
  }

  async validateEmailVerificationTokenOrThrow(emailVerificationToken: string) {
    const hashedToken = crypto
      .createHash('sha256')
      .update(emailVerificationToken)
      .digest('hex');

    const appToken = await this.appTokenRepository.findOne({
      where: {
        value: hashedToken,
        type: AppTokenType.EmailVerificationToken,
      },
      relations: ['user'],
    });

    if (!appToken) {
      throw new EmailVerificationException(
        'Invalid email verification token',
        EmailVerificationExceptionCode.INVALID_TOKEN,
      );
    }

    if (appToken.type !== AppTokenType.EmailVerificationToken) {
      throw new EmailVerificationException(
        'Invalid email verification token type',
        EmailVerificationExceptionCode.INVALID_APP_TOKEN_TYPE,
      );
    }

    if (new Date() > appToken.expiresAt) {
      throw new EmailVerificationException(
        'Email verification token expired',
        EmailVerificationExceptionCode.TOKEN_EXPIRED,
      );
    }

    if (!appToken.context?.email) {
      throw new EmailVerificationException(
        'Email missing in email verification token context',
        EmailVerificationExceptionCode.EMAIL_MISSING,
      );
    }

    await this.appTokenRepository.remove(appToken);

    return appToken.user;
  }
}
