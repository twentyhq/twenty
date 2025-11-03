import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import crypto from 'crypto';

import { msg } from '@lingui/core/macro';
import { render } from '@react-email/render';
import { addMilliseconds, differenceInMilliseconds } from 'date-fns';
import ms from 'ms';
import { PasswordResetLinkEmail } from 'twenty-emails';
import { type APP_LOCALES } from 'twenty-shared/translations';
import { AppPath } from 'twenty-shared/types';
import {
  assertIsDefinedOrThrow,
  getAppPath,
  isDefined,
} from 'twenty-shared/utils';
import { IsNull, MoreThan, Repository } from 'typeorm';

import {
  AppTokenEntity,
  AppTokenType,
} from 'src/engine/core-modules/app-token/app-token.entity';
import {
  AuthException,
  AuthExceptionCode,
} from 'src/engine/core-modules/auth/auth.exception';
import { type EmailPasswordResetLinkOutput } from 'src/engine/core-modules/auth/dto/email-password-reset-link.dto';
import { type InvalidatePasswordOutput } from 'src/engine/core-modules/auth/dto/invalidate-password.dto';
import { type PasswordResetToken } from 'src/engine/core-modules/auth/dto/password-reset-token.dto';
import { type ValidatePasswordResetTokenOutput } from 'src/engine/core-modules/auth/dto/validate-password-reset-token.dto';
import { WorkspaceDomainsService } from 'src/engine/core-modules/domain/workspace-domains/services/workspace-domains.service';
import { EmailService } from 'src/engine/core-modules/email/email.service';
import { I18nService } from 'src/engine/core-modules/i18n/i18n.service';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { UserService } from 'src/engine/core-modules/user/services/user.service';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { WorkspaceNotFoundDefaultError } from 'src/engine/core-modules/workspace/workspace.exception';

@Injectable()
export class ResetPasswordService {
  constructor(
    private readonly twentyConfigService: TwentyConfigService,
    private readonly workspaceDomainsService: WorkspaceDomainsService,
    @InjectRepository(WorkspaceEntity)
    private readonly workspaceRepository: Repository<WorkspaceEntity>,
    @InjectRepository(AppTokenEntity)
    private readonly appTokenRepository: Repository<AppTokenEntity>,
    private readonly emailService: EmailService,
    private readonly i18nService: I18nService,
    private readonly userService: UserService,
  ) {}

  async generatePasswordResetToken(
    email: string,
    workspaceId: string,
  ): Promise<PasswordResetToken> {
    const user = await this.userService.findUserByEmailOrThrow(
      email,
      new AuthException('User not found', AuthExceptionCode.INVALID_INPUT),
    );

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
  ): Promise<EmailPasswordResetLinkOutput> {
    const user = await this.userService.findUserByEmailOrThrow(
      email,
      new AuthException('User not found', AuthExceptionCode.INVALID_INPUT),
    );
    const hasPassword = isDefined(user.passwordHash);

    const workspace = await this.workspaceRepository.findOneBy({
      id: resetToken.workspaceId,
    });

    assertIsDefinedOrThrow(workspace, WorkspaceNotFoundDefaultError);

    const link = this.workspaceDomainsService.buildWorkspaceURL({
      workspace,
      pathname: getAppPath(AppPath.ResetPassword, {
        passwordResetToken: resetToken.passwordResetToken,
      }),
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
      hasPassword,
      locale,
    };

    const emailTemplate = PasswordResetLinkEmail(emailData);

    const html = await render(emailTemplate, { pretty: true });
    const text = await render(emailTemplate, { plainText: true });

    const i18n = this.i18nService.getI18nInstance(locale);
    const subjectTemplate = hasPassword
      ? msg`Action Needed to Reset Password`
      : msg`Action Needed to Set Password`;
    const subject = i18n._(subjectTemplate);

    await this.emailService.send({
      from: `${this.twentyConfigService.get(
        'EMAIL_FROM_NAME',
      )} <${this.twentyConfigService.get('EMAIL_FROM_ADDRESS')}>`,
      to: user.email,
      subject,
      text,
      html,
    });

    return { success: true };
  }

  async validatePasswordResetToken(
    resetToken: string,
  ): Promise<ValidatePasswordResetTokenOutput> {
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

    const user = await this.userService.findUserByIdOrThrow(
      token.userId,
      new AuthException('User not found', AuthExceptionCode.INVALID_INPUT),
    );

    return {
      id: user.id,
      email: user.email,
      hasPassword: isDefined(user.passwordHash),
    };
  }

  async invalidatePasswordResetToken(
    userId: string,
  ): Promise<InvalidatePasswordOutput> {
    const user = await this.userService.findUserByIdOrThrow(
      userId,
      new AuthException('User not found', AuthExceptionCode.INVALID_INPUT),
    );

    await this.appTokenRepository.update(
      {
        userId: user.id,
        type: AppTokenType.PasswordResetToken,
      },
      {
        revokedAt: new Date(),
      },
    );

    return { success: true };
  }
}
