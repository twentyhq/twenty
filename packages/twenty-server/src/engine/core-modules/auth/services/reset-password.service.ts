import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import crypto from 'crypto';

import { msg } from '@lingui/core/macro';
import { addMilliseconds, differenceInMilliseconds } from 'date-fns';
import ms from 'ms';
import { PasswordResetLinkEmail, renderEmail } from 'twenty-emails';
import { type APP_LOCALES } from 'twenty-shared/translations';
import { AppPath } from 'twenty-shared/types';
import { getAppPath, isDefined } from 'twenty-shared/utils';
import { IsNull, MoreThan, Repository } from 'typeorm';

import {
  AppTokenEntity,
  AppTokenType,
} from 'src/engine/core-modules/app-token/app-token.entity';
import {
  AuthException,
  AuthExceptionCode,
} from 'src/engine/core-modules/auth/auth.exception';
import { type EmailPasswordResetLinkDTO } from 'src/engine/core-modules/auth/dto/email-password-reset-link.dto';
import { type InvalidatePasswordDTO } from 'src/engine/core-modules/auth/dto/invalidate-password.dto';
import { type ValidatePasswordResetTokenDTO } from 'src/engine/core-modules/auth/dto/validate-password-reset-token.dto';
import { type PasswordResetToken } from 'src/engine/core-modules/auth/types/password-reset-token.type';
import { type PasswordResetTokenGenerationResult } from 'src/engine/core-modules/auth/types/password-reset-token-generation-result.type';
import { WorkspaceDomainsService } from 'src/engine/core-modules/domain/workspace-domains/services/workspace-domains.service';
import { EmailSenderService } from 'src/engine/core-modules/email/email-sender.service';
import { I18nService } from 'src/engine/core-modules/i18n/i18n.service';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { UserService } from 'src/engine/core-modules/user/services/user.service';
import { type UserEntity } from 'src/engine/core-modules/user/user.entity';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';

@Injectable()
export class ResetPasswordService {
  constructor(
    private readonly twentyConfigService: TwentyConfigService,
    private readonly workspaceDomainsService: WorkspaceDomainsService,
    @InjectRepository(WorkspaceEntity)
    private readonly workspaceRepository: Repository<WorkspaceEntity>,
    @InjectRepository(AppTokenEntity)
    private readonly appTokenRepository: Repository<AppTokenEntity>,
    private readonly emailSenderService: EmailSenderService,
    private readonly i18nService: I18nService,
    private readonly userService: UserService,
  ) {}

  async generatePasswordResetToken(
    email: string,
    workspaceId?: string,
  ): Promise<PasswordResetTokenGenerationResult> {
    const user = await this.userService.findUserByEmail(email);

    if (!isDefined(user)) {
      return { status: 'USER_NOT_FOUND' };
    }

    const targetWorkspace = await this.resolveTargetWorkspace(
      user.id,
      workspaceId,
    );

    if (!isDefined(targetWorkspace)) {
      return { status: 'NO_PASSWORD_AUTH_ENABLED_WORKSPACE_FOUND' };
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

    const expiresAt = addMilliseconds(new Date().getTime(), ms(expiresIn));

    const plainResetToken = crypto.randomBytes(32).toString('hex');

    return {
      status: 'TOKEN_GENERATED',
      resetToken: {
        workspaceId: targetWorkspace.id,
        passwordResetToken: plainResetToken,
        passwordResetTokenExpiresAt: expiresAt,
      },
      user,
      workspace: targetWorkspace,
    };
  }

  async rotatePasswordResetToken({
    userId,
    resetToken,
  }: {
    userId: string;
    resetToken: PasswordResetToken;
  }): Promise<void> {
    const hashedResetToken = crypto
      .createHash('sha256')
      .update(resetToken.passwordResetToken)
      .digest('hex');

    await this.appTokenRepository.manager.transaction(async (entityManager) => {
      const appTokenRepository = entityManager.getRepository(AppTokenEntity);

      await appTokenRepository.update(
        {
          userId,
          type: AppTokenType.PasswordResetToken,
        },
        {
          revokedAt: new Date(),
        },
      );

      await appTokenRepository.save({
        userId,
        workspaceId: resetToken.workspaceId,
        value: hashedResetToken,
        expiresAt: resetToken.passwordResetTokenExpiresAt,
        type: AppTokenType.PasswordResetToken,
      });
    });
  }

  private async resolveTargetWorkspace(
    userId: string,
    workspaceId?: string,
  ): Promise<WorkspaceEntity | null> {
    if (!isDefined(workspaceId)) {
      return this.findFirstPasswordAuthEnabledWorkspace(userId);
    }

    const requestedWorkspace = await this.workspaceRepository.findOne({
      where: {
        id: workspaceId,
        isPasswordAuthEnabled: true,
        workspaceUsers: {
          user: {
            id: userId,
          },
        },
      },
    });

    return isDefined(requestedWorkspace)
      ? requestedWorkspace
      : this.findFirstPasswordAuthEnabledWorkspace(userId);
  }

  async sendEmailPasswordResetLink({
    resetToken,
    user,
    workspace,
    locale,
  }: {
    resetToken: PasswordResetToken;
    user: UserEntity;
    workspace: WorkspaceEntity;
    locale: keyof typeof APP_LOCALES;
  }): Promise<EmailPasswordResetLinkDTO> {
    const hasPassword = isDefined(user.passwordHash);

    const resetPasswordPath = getAppPath(AppPath.ResetPassword, {
      passwordResetToken: resetToken.passwordResetToken,
    });

    const link = this.workspaceDomainsService.buildWorkspaceURL({
      workspace,
      pathname: resetPasswordPath,
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

    const html = await renderEmail(emailTemplate, { pretty: true });
    const text = await renderEmail(emailTemplate, { plainText: true });

    const i18n = this.i18nService.getI18nInstance(locale);
    const subjectTemplate = hasPassword
      ? msg`Action Needed to Reset Password`
      : msg`Action Needed to Set Password`;
    const subject = i18n._(subjectTemplate);

    await this.emailSenderService.send({
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
  ): Promise<ValidatePasswordResetTokenDTO> {
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
  ): Promise<InvalidatePasswordDTO> {
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

  private async findFirstPasswordAuthEnabledWorkspace(
    userId: string,
  ): Promise<WorkspaceEntity | null> {
    return await this.workspaceRepository.findOne({
      where: {
        workspaceUsers: {
          user: {
            id: userId,
          },
        },
        isPasswordAuthEnabled: true,
      },
      order: {
        createdAt: 'ASC',
      },
    });
  }
}
