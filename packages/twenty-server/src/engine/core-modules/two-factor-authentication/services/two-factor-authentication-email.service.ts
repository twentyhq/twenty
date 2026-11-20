import { Injectable, Logger } from '@nestjs/common';

import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';
import {
  TwoFactorAuthenticationBackupCodeUsedEmail,
  TwoFactorAuthenticationBackupCodesRegeneratedEmail,
  TwoFactorAuthenticationRecoveryCodeIssuedEmail,
  TwoFactorAuthenticationRemovedEmail,
  TwoFactorAuthenticationResetEmail,
  renderEmail,
} from 'twenty-emails';
import { SOURCE_LOCALE } from 'twenty-shared/translations';
import { isDefined } from 'twenty-shared/utils';

import { type AuthContextUser } from 'src/engine/core-modules/auth/types/auth-context.type';
import { EmailService } from 'src/engine/core-modules/email/email.service';
import { I18nService } from 'src/engine/core-modules/i18n/i18n.service';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { TwoFactorAuthenticationBackupCodeService } from 'src/engine/core-modules/two-factor-authentication/services/two-factor-authentication-backup-code.service';
import { type UserWorkspaceEntity } from 'src/engine/core-modules/user-workspace/user-workspace.entity';
import { UserWorkspaceService } from 'src/engine/core-modules/user-workspace/user-workspace.service';
import { type UserEntity } from 'src/engine/core-modules/user/user.entity';
import { type WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';

type TwoFactorAuthenticationEmailRecipient = {
  userId: UserEntity['id'];
  workspaceId: WorkspaceEntity['id'];
};

type TwoFactorAuthenticationEmailContext = {
  locale: NonNullable<UserWorkspaceEntity['locale']>;
  workspaceDisplayName: string;
};

@Injectable()
// oxlint-disable-next-line twenty/inject-workspace-repository
export class TwoFactorAuthenticationEmailService {
  private readonly logger = new Logger(
    TwoFactorAuthenticationEmailService.name,
  );

  constructor(
    private readonly emailService: EmailService,
    private readonly i18nService: I18nService,
    private readonly twentyConfigService: TwentyConfigService,
    private readonly userWorkspaceService: UserWorkspaceService,
    private readonly twoFactorAuthenticationBackupCodeService: TwoFactorAuthenticationBackupCodeService,
  ) {}

  async sendRecoveryCodeIssuedEmail({
    actor,
    expiresAt,
    ...recipient
  }: TwoFactorAuthenticationEmailRecipient & {
    actor: Pick<AuthContextUser, 'email' | 'firstName' | 'lastName'>;
    expiresAt: Date;
  }): Promise<void> {
    await this.sendSecurityEmail({
      ...recipient,
      subject: msg`A two-factor authentication recovery code was generated for you`,
      buildEmailTemplate: async ({ locale, workspaceDisplayName }) =>
        TwoFactorAuthenticationRecoveryCodeIssuedEmail({
          actorName:
            `${actor.firstName} ${actor.lastName}`.trim() || actor.email,
          workspaceDisplayName,
          expiresAt,
          locale,
        }),
    });
  }

  async sendTwoFactorAuthenticationResetEmail(
    recipient: TwoFactorAuthenticationEmailRecipient,
  ): Promise<void> {
    await this.sendSecurityEmail({
      ...recipient,
      subject: msg`Your two-factor authentication was reset`,
      buildEmailTemplate: async ({ locale, workspaceDisplayName }) =>
        TwoFactorAuthenticationResetEmail({ workspaceDisplayName, locale }),
    });
  }

  async sendBackupCodeUsedEmail(
    recipient: TwoFactorAuthenticationEmailRecipient,
  ): Promise<void> {
    await this.sendSecurityEmail({
      ...recipient,
      subject: msg`A backup code was used to sign in to your account`,
      buildEmailTemplate: async ({ locale, workspaceDisplayName }) =>
        TwoFactorAuthenticationBackupCodeUsedEmail({
          workspaceDisplayName,
          remainingBackupCodeCount:
            await this.twoFactorAuthenticationBackupCodeService.getRemainingBackupCodeCount(
              recipient,
            ),
          locale,
        }),
    });
  }

  async sendBackupCodesRegeneratedEmail(
    recipient: TwoFactorAuthenticationEmailRecipient,
  ): Promise<void> {
    await this.sendSecurityEmail({
      ...recipient,
      subject: msg`New backup codes were generated for your account`,
      buildEmailTemplate: async ({ locale, workspaceDisplayName }) =>
        TwoFactorAuthenticationBackupCodesRegeneratedEmail({
          workspaceDisplayName,
          locale,
        }),
    });
  }

  async sendTwoFactorAuthenticationRemovedEmail(
    recipient: TwoFactorAuthenticationEmailRecipient,
  ): Promise<void> {
    await this.sendSecurityEmail({
      ...recipient,
      subject: msg`Two-factor authentication was removed from your account`,
      buildEmailTemplate: async ({ locale, workspaceDisplayName }) =>
        TwoFactorAuthenticationRemovedEmail({ workspaceDisplayName, locale }),
    });
  }

  // The action this email reports has already happened, so nothing in here may throw
  private async sendSecurityEmail({
    userId,
    workspaceId,
    subject,
    buildEmailTemplate,
  }: TwoFactorAuthenticationEmailRecipient & {
    subject: MessageDescriptor;
    buildEmailTemplate: (
      context: TwoFactorAuthenticationEmailContext,
    ) => Promise<Parameters<typeof renderEmail>[0]>;
  }): Promise<void> {
    try {
      const userWorkspace =
        await this.userWorkspaceService.getUserWorkspaceForUser({
          userId,
          workspaceId,
          relations: ['user', 'workspace'],
        });

      if (!isDefined(userWorkspace)) {
        throw new Error('User workspace not found');
      }

      const locale = userWorkspace.locale ?? SOURCE_LOCALE;
      const emailTemplate = await buildEmailTemplate({
        locale,
        workspaceDisplayName: userWorkspace.workspace.displayName ?? '',
      });
      const html = await renderEmail(emailTemplate, { pretty: true });
      const text = await renderEmail(emailTemplate, { plainText: true });
      const i18n = this.i18nService.getI18nInstance(locale);

      await this.emailService.send({
        from: `${this.twentyConfigService.get('EMAIL_FROM_NAME')} <${this.twentyConfigService.get('EMAIL_FROM_ADDRESS')}>`,
        to: userWorkspace.user.email,
        subject: i18n._(subject),
        text,
        html,
      });
    } catch (error) {
      this.logger.error(
        `Failed to send a two-factor authentication security email to user ${userId} in workspace ${workspaceId}`,
        error,
      );
    }
  }
}
