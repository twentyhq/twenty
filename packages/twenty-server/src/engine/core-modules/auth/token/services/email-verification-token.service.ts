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
import { castAppTokenToEmailVerification } from 'src/engine/core-modules/email-verification/utils/cast-app-token-to-email-verification.util';
import { EnvironmentService } from 'src/engine/core-modules/environment/environment.service';
import { UserService } from 'src/engine/core-modules/user/services/user.service';

@Injectable()
export class EmailVerificationTokenService {
  constructor(
    @InjectRepository(AppToken, 'core')
    private readonly appTokenRepository: Repository<AppToken>,
    private readonly environmentService: EnvironmentService,
    private readonly userService: UserService,
  ) {}

  async generateToken(userId: string, email: string): Promise<AuthToken> {
    const expiresIn = this.environmentService.get(
      'EMAIL_VERIFICATION_TOKEN_EXPIRES_IN',
    );
    const expiresAt = addMilliseconds(new Date().getTime(), ms(expiresIn));

    const verificationToken = this.appTokenRepository.create({
      userId,
      expiresAt,
      type: AppTokenType.EmailVerificationToken,
      value: crypto.randomBytes(32).toString('hex'),
      context: { email },
    });

    await this.appTokenRepository.save(verificationToken);

    return {
      token: verificationToken.id,
      expiresAt,
    };
  }

  async verifyToken(token: string) {
    const appToken = await this.appTokenRepository.findOne({
      where: {
        id: token,
        type: AppTokenType.EmailVerificationToken,
      },
      relations: ['user'],
    });

    if (!appToken) {
      throw new EmailVerificationException(
        'Invalid token',
        EmailVerificationExceptionCode.INVALID_TOKEN,
      );
    }

    const { userId } = castAppTokenToEmailVerification(appToken);

    const user = await this.userService.markEmailAsVerified(userId);

    await this.appTokenRepository.remove(appToken);

    return {
      success: true,
      email: user.email,
    };
  }
}
