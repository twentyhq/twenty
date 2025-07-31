import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import crypto from 'crypto';

import { i18n } from '@lingui/core';
import { t } from '@lingui/core/macro';
import { render } from '@react-email/render';
import { addMilliseconds, differenceInMilliseconds } from 'date-fns';
import ms from 'ms';
import { PasswordResetLinkEmail } from 'twenty-emails';
import { APP_LOCALES } from 'twenty-shared/translations';
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
import { DomainManagerService } from 'src/engine/core-modules/domain-manager/services/domain-manager.service';
import { EmailService } from 'src/engine/core-modules/email/email.service';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { User } from 'src/engine/core-modules/user/user.entity';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { workspaceValidator } from 'src/engine/core-modules/workspace/workspace.validate';

@Injectable()
export class ResetPasswordService {
  constructor(
    private readonly twentyConfigService: TwentyConfigService,
    private readonly domainManagerService: DomainManagerService,
    @InjectRepository(User, 'core')
    private readonly userRepository: Repository<User>,
    @InjectRepository(Workspace, 'core')
    private readonly workspaceRepository: Repository<Workspace>,
    @InjectRepository(AppToken, 'core')
    private readonly appTokenRepository: Repository<AppToken>,
    private readonly emailService: EmailService,
  ) {}

  async generatePasswordResetToken(
    email: string,
    workspaceId: string,
  ): Promise<PasswordResetToken> {
    const user = await this.userRepository.findOneBy({
      email,
    });

    if (!user) {
      throw new AuthException(
        'User not found',
        AuthExceptionCode.INVALID_INPUT,
      );
    }

    const expiresIn = this.twentyConfigService.get(
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
      workspaceId: workspaceId,
      value: hashedResetToken,
      expiresAt,
      type: AppTokenType.PasswordResetToken,
    });

    return {
      workspaceId,
      passwordResetToken: plainResetToken,
      passwordResetTokenExpiresAt: expiresAt,
    };
  }

  async sendEmailPasswordResetLink(
    resetToken: PasswordResetToken,
    email: string,
    locale: keyof typeof APP_LOCALES,
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

    const workspace = await this.workspaceRepository.findOneBy({
      id: resetToken.workspaceId,
    });

    workspaceValidator.assertIsDefinedOrThrow(workspace);

    const link = this.domainManagerService.buildWorkspaceURL({
      workspace,
      pathname: `/reset-password/${resetToken.passwordResetToken}`,
    });

    const emailData = {
      link: link.toString(),
      duration: ms(
        differenceInMilliseconds(
          resetToken.passwordResetTokenExpiresAt,
          new Date(),
        ),
        {
          long: true,
        },
      ),
      locale,
    };

    const emailTemplate = PasswordResetLinkEmail(emailData);

    const html = render(emailTemplate, { pretty: true });
    const text = render(emailTemplate, { plainText: true });

    i18n.activate(locale);

    this.emailService.send({
      from: `${this.twentyConfigService.get(
        'EMAIL_FROM_NAME',
      )} <${this.twentyConfigService.get('EMAIL_FROM_ADDRESS')}>`,
      to: email,
      subject: t`Action Needed to Reset Password`,
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
