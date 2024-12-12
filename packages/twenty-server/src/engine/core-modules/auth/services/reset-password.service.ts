import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import crypto from 'crypto';

import { render } from '@react-email/render';
import { addMilliseconds, differenceInMilliseconds } from 'date-fns';
import ms from 'ms';
import { PasswordResetLinkEmail } from 'twenty-emails';
import { IsNull, MoreThan, Repository } from 'typeorm';

import {
  AppToken,
  AppTokenType,
} from 'src/engine/core-modules/app-token/app-token.entity';
import {
  AuthException,
  AuthExceptionCode,
} from 'src/engine/core-modules/auth/auth.exception';
import { EmailPasswordResetLink } from 'src/engine/core-modules/auth/dto/email-password-reset-link.entity';
import { InvalidatePassword } from 'src/engine/core-modules/auth/dto/invalidate-password.entity';
import { PasswordResetToken } from 'src/engine/core-modules/auth/dto/token.entity';
import { ValidatePasswordResetToken } from 'src/engine/core-modules/auth/dto/validate-password-reset-token.entity';
import { DomainManagerService } from 'src/engine/core-modules/domain-manager/service/domain-manager.service';
import { EmailService } from 'src/engine/core-modules/email/email.service';
import { EnvironmentService } from 'src/engine/core-modules/environment/environment.service';
import { User } from 'src/engine/core-modules/user/user.entity';

@Injectable()
export class ResetPasswordService {
  constructor(
    private readonly environmentService: EnvironmentService,
    private readonly domainManagerService: DomainManagerService,
    @InjectRepository(User, 'core')
    private readonly userRepository: Repository<User>,
    @InjectRepository(AppToken, 'core')
    private readonly appTokenRepository: Repository<AppToken>,
    private readonly emailService: EmailService,
  ) {}

  async generatePasswordResetToken(email: string): Promise<PasswordResetToken> {
    const user = await this.userRepository.findOneBy({
      email,
    });

    if (!user) {
      throw new AuthException(
        'User not found',
        AuthExceptionCode.INVALID_INPUT,
      );
    }

    const expiresIn = this.environmentService.get(
      'PASSWORD_RESET_TOKEN_EXPIRES_IN',
    );

    if (!expiresIn) {
      throw new AuthException(
        'PASSWORD_RESET_TOKEN_EXPIRES_IN constant value not found',
        AuthExceptionCode.INTERNAL_SERVER_ERROR,
      );
    }

    const existingToken = await this.appTokenRepository.findOne({
      where: {
        userId: user.id,
        type: AppTokenType.PasswordResetToken,
        expiresAt: MoreThan(new Date()),
        revokedAt: IsNull(),
      },
    });

    if (existingToken) {
      const timeToWait = ms(
        differenceInMilliseconds(existingToken.expiresAt, new Date()),
        { long: true },
      );

      throw new AuthException(
        `Token has already been generated. Please wait for ${timeToWait} to generate again.`,
        AuthExceptionCode.INVALID_INPUT,
      );
    }

    const plainResetToken = crypto.randomBytes(32).toString('hex');
    const hashedResetToken = crypto
      .createHash('sha256')
      .update(plainResetToken)
      .digest('hex');

    const expiresAt = addMilliseconds(new Date().getTime(), ms(expiresIn));

    await this.appTokenRepository.save({
      userId: user.id,
      value: hashedResetToken,
      expiresAt,
      type: AppTokenType.PasswordResetToken,
    });

    return {
      passwordResetToken: plainResetToken,
      passwordResetTokenExpiresAt: expiresAt,
    };
  }

  async sendEmailPasswordResetLink(
    resetToken: PasswordResetToken,
    email: string,
  ): Promise<EmailPasswordResetLink> {
    const user = await this.userRepository.findOneBy({
      email,
    });

    if (!user) {
      throw new AuthException(
        'User not found',
        AuthExceptionCode.INVALID_INPUT,
      );
    }

    const frontBaseURL = this.domainManagerService.getBaseUrl();

    frontBaseURL.pathname = `/reset-password/${resetToken.passwordResetToken}`;

    const emailData = {
      link: frontBaseURL.toString(),
      duration: ms(
        differenceInMilliseconds(
          resetToken.passwordResetTokenExpiresAt,
          new Date(),
        ),
        {
          long: true,
        },
      ),
    };

    const emailTemplate = PasswordResetLinkEmail(emailData);
    const html = render(emailTemplate, {
      pretty: true,
    });

    const text = render(emailTemplate, {
      plainText: true,
    });

    this.emailService.send({
      from: `${this.environmentService.get(
        'EMAIL_FROM_NAME',
      )} <${this.environmentService.get('EMAIL_FROM_ADDRESS')}>`,
      to: email,
      subject: 'Action Needed to Reset Password',
      text,
      html,
    });

    return { success: true };
  }

  async validatePasswordResetToken(
    resetToken: string,
  ): Promise<ValidatePasswordResetToken> {
    const hashedResetToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');

    const token = await this.appTokenRepository.findOne({
      where: {
        value: hashedResetToken,
        type: AppTokenType.PasswordResetToken,
        expiresAt: MoreThan(new Date()),
        revokedAt: IsNull(),
      },
    });

    if (!token || !token.userId) {
      throw new AuthException(
        'Token is invalid',
        AuthExceptionCode.FORBIDDEN_EXCEPTION,
      );
    }

    const user = await this.userRepository.findOneBy({
      id: token.userId,
    });

    if (!user) {
      throw new AuthException(
        'User not found',
        AuthExceptionCode.INVALID_INPUT,
      );
    }

    return {
      id: user.id,
      email: user.email,
    };
  }

  async invalidatePasswordResetToken(
    userId: string,
  ): Promise<InvalidatePassword> {
    const user = await this.userRepository.findOneBy({
      id: userId,
    });

    if (!user) {
      throw new AuthException(
        'User not found',
        AuthExceptionCode.INVALID_INPUT,
      );
    }

    await this.appTokenRepository.update(
      {
        userId,
        type: AppTokenType.PasswordResetToken,
      },
      {
        revokedAt: new Date(),
      },
    );

    return { success: true };
  }
}
