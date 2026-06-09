import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { msg } from '@lingui/core/macro';
import { render } from '@react-email/render';
import { isNonEmptyString } from '@sniptt/guards';
import { ServerAdminAccessChangedEmail } from 'twenty-emails';
import { SOURCE_LOCALE } from 'twenty-shared/translations';
import { isDefined } from 'twenty-shared/utils';
import { Repository } from 'typeorm';

import { CoreEntityCacheService } from 'src/engine/core-entity-cache/services/core-entity-cache.service';
import { type ServerAdminDTO } from 'src/engine/core-modules/admin-panel/dtos/server-admin.dto';
import { type AuthContextUser } from 'src/engine/core-modules/auth/types/auth-context.type';
import { EmailService } from 'src/engine/core-modules/email/email.service';
import { EventLogEmitterService } from 'src/engine/core-modules/event-logs/emit/event-log-emitter.service';
import { SERVER_ADMIN_ACCESS_CHANGED_EVENT } from 'src/engine/core-modules/event-logs/emit/events/workspace-event/server-admin/server-admin-access-changed';
import { UserInputError } from 'src/engine/core-modules/graphql/utils/graphql-errors.util';
import { I18nService } from 'src/engine/core-modules/i18n/i18n.service';
import { NodeEnvironment } from 'src/engine/core-modules/twenty-config/interfaces/node-environment.interface';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { TwoFactorAuthenticationService } from 'src/engine/core-modules/two-factor-authentication/two-factor-authentication.service';
import { twoFactorAuthenticationMethodsValidator } from 'src/engine/core-modules/two-factor-authentication/two-factor-authentication.validation';
import { UserWorkspaceEntity } from 'src/engine/core-modules/user-workspace/user-workspace.entity';
import { UserEntity } from 'src/engine/core-modules/user/user.entity';

@Injectable()
export class AdminPanelServerAdminService {
  private readonly logger = new Logger(AdminPanelServerAdminService.name);

  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    @InjectRepository(UserWorkspaceEntity)
    private readonly userWorkspaceRepository: Repository<UserWorkspaceEntity>,
    private readonly coreEntityCacheService: CoreEntityCacheService,
    private readonly twoFactorAuthenticationService: TwoFactorAuthenticationService,
    private readonly emailService: EmailService,
    private readonly i18nService: I18nService,
    private readonly twentyConfigService: TwentyConfigService,
    private readonly eventLogEmitterService: EventLogEmitterService,
  ) {}

  async getServerAdmins(): Promise<ServerAdminDTO[]> {
    const admins = await this.userRepository.find({
      where: [{ canAccessFullAdminPanel: true }, { canImpersonate: true }],
      order: { firstName: 'ASC', lastName: 'ASC' },
    });

    return admins.map((admin) => this.toServerAdminDTO(admin));
  }

  async updateServerAdminAccess({
    actor,
    actorWorkspaceId,
    targetUserId,
    canAccessFullAdminPanel,
    canImpersonate,
    otp,
  }: {
    actor: AuthContextUser;
    actorWorkspaceId: string;
    targetUserId: string;
    canAccessFullAdminPanel?: boolean;
    canImpersonate?: boolean;
    otp?: string;
  }): Promise<ServerAdminDTO> {
    if (!isDefined(canAccessFullAdminPanel) && !isDefined(canImpersonate)) {
      throw new UserInputError('No administrator access change was provided.');
    }

    const targetUser = await this.userRepository.findOne({
      where: { id: targetUserId },
    });

    if (!isDefined(targetUser)) {
      throw new UserInputError('User not found.');
    }

    await this.assertFreshStepUpAuthentication({
      actorUserId: actor.id,
      actorWorkspaceId,
      otp,
    });

    const nextCanAccessFullAdminPanel =
      canAccessFullAdminPanel ?? targetUser.canAccessFullAdminPanel;
    const nextCanImpersonate = canImpersonate ?? targetUser.canImpersonate;

    const hasChange =
      nextCanAccessFullAdminPanel !== targetUser.canAccessFullAdminPanel ||
      nextCanImpersonate !== targetUser.canImpersonate;

    if (!hasChange) {
      return this.toServerAdminDTO(targetUser);
    }

    const isRevokingFullAdmin =
      targetUser.canAccessFullAdminPanel === true &&
      nextCanAccessFullAdminPanel === false;

    targetUser.canAccessFullAdminPanel = nextCanAccessFullAdminPanel;
    targetUser.canImpersonate = nextCanImpersonate;

    await this.userRepository.manager.transaction(async (manager) => {
      if (isRevokingFullAdmin) {
        const lockedFullAdmins = await manager.find(UserEntity, {
          where: { canAccessFullAdminPanel: true },
          lock: { mode: 'pessimistic_write' },
        });

        const otherFullAdmins = lockedFullAdmins.filter(
          (admin) => admin.id !== targetUserId,
        );

        if (otherFullAdmins.length === 0) {
          throw new UserInputError(
            'You cannot revoke admin panel access from the last server administrator.',
          );
        }
      }

      await manager.save(UserEntity, targetUser);
    });

    await this.coreEntityCacheService.invalidate('user', targetUserId);

    this.logger.log(
      `Server admin access for user ${targetUserId} updated by ${actor.id}: ` +
        `canAccessFullAdminPanel=${nextCanAccessFullAdminPanel}, canImpersonate=${nextCanImpersonate}`,
    );

    this.emitServerAdminAccessChangedEvent({
      actor,
      actorWorkspaceId,
      targetUser,
    });

    await this.notifyAdministrators({ actor, targetUser });

    return this.toServerAdminDTO(targetUser);
  }

  private async assertFreshStepUpAuthentication({
    actorUserId,
    actorWorkspaceId,
    otp,
  }: {
    actorUserId: string;
    actorWorkspaceId: string;
    otp?: string;
  }): Promise<void> {
    const isDevelopment =
      this.twentyConfigService.get('NODE_ENV') === NodeEnvironment.DEVELOPMENT;

    if (isDevelopment) {
      return;
    }

    if (!isNonEmptyString(otp)) {
      throw new UserInputError(
        'A two-factor authentication code is required to change server administrator access.',
      );
    }

    // Verify against the actor's current workspace only — checking the same code
    // against every workspace they belong to would allow one OTP guess per
    // workspace, weakening brute-force resistance.
    const actorUserWorkspace = await this.userWorkspaceRepository.findOne({
      where: { userId: actorUserId, workspaceId: actorWorkspaceId },
      relations: ['twoFactorAuthenticationMethods'],
    });

    const hasVerifiedTwoFactor =
      isDefined(actorUserWorkspace) &&
      twoFactorAuthenticationMethodsValidator.areDefined(
        actorUserWorkspace.twoFactorAuthenticationMethods,
      ) &&
      twoFactorAuthenticationMethodsValidator.areVerified(
        actorUserWorkspace.twoFactorAuthenticationMethods,
      );

    if (!hasVerifiedTwoFactor) {
      throw new UserInputError(
        'Enable two-factor authentication in your current workspace to manage server administrators.',
      );
    }

    // A wrong code throws INVALID_OTP, which the resolver's
    // TwoFactorAuthenticationExceptionFilter maps to a user-friendly message.
    await this.twoFactorAuthenticationService.verifyTwoFactorAuthenticationMethodForAuthenticatedUser(
      actorUserId,
      otp,
      actorWorkspaceId,
    );
  }

  private async notifyAdministrators({
    actor,
    targetUser,
  }: {
    actor: AuthContextUser;
    targetUser: UserEntity;
  }): Promise<void> {
    try {
      const fullAdmins = await this.userRepository.find({
        where: { canAccessFullAdminPanel: true },
      });

      const recipientsById = new Map<string, UserEntity>();

      for (const fullAdmin of fullAdmins) {
        recipientsById.set(fullAdmin.id, fullAdmin);
      }
      recipientsById.set(targetUser.id, targetUser);

      const actorName = `${actor.firstName} ${actor.lastName}`.trim();
      const targetName =
        `${targetUser.firstName} ${targetUser.lastName}`.trim();
      const from = `${this.twentyConfigService.get('EMAIL_FROM_NAME')} <${this.twentyConfigService.get('EMAIL_FROM_ADDRESS')}>`;

      const recipientsByLocale = new Map<UserEntity['locale'], UserEntity[]>();

      for (const recipient of recipientsById.values()) {
        const locale = recipient.locale || SOURCE_LOCALE;
        const localeRecipients = recipientsByLocale.get(locale) ?? [];

        localeRecipients.push(recipient);
        recipientsByLocale.set(locale, localeRecipients);
      }

      await Promise.allSettled(
        Array.from(recipientsByLocale.entries()).map(
          async ([locale, recipients]) => {
            const emailTemplate = ServerAdminAccessChangedEmail({
              actorName,
              targetName,
              targetEmail: targetUser.email,
              canAccessFullAdminPanel: targetUser.canAccessFullAdminPanel,
              canImpersonate: targetUser.canImpersonate,
              locale,
            });
            const html = await render(emailTemplate, { pretty: true });
            const text = await render(emailTemplate, { plainText: true });

            const i18n = this.i18nService.getI18nInstance(locale);
            const subject = i18n._(msg`Server administrator access changed`);

            const sendResults = await Promise.allSettled(
              recipients.map((recipient) =>
                this.emailService.send({
                  from,
                  to: recipient.email,
                  subject,
                  text,
                  html,
                }),
              ),
            );

            const failedCount = sendResults.filter(
              (result) => result.status === 'rejected',
            ).length;

            if (failedCount > 0) {
              this.logger.error(
                `Failed to enqueue ${failedCount} server admin access notification email(s) for locale ${locale}`,
              );
            }
          },
        ),
      );
    } catch (error) {
      this.logger.error(
        'Failed to send server admin access change notifications',
        error,
      );
    }
  }

  private emitServerAdminAccessChangedEvent({
    actor,
    actorWorkspaceId,
    targetUser,
  }: {
    actor: AuthContextUser;
    actorWorkspaceId: string;
    targetUser: UserEntity;
  }): void {
    void this.eventLogEmitterService
      .createContext({ workspaceId: actorWorkspaceId, userId: actor.id })
      .insertWorkspaceEvent(SERVER_ADMIN_ACCESS_CHANGED_EVENT, {
        targetUserId: targetUser.id,
        canAccessFullAdminPanel: targetUser.canAccessFullAdminPanel,
        canImpersonate: targetUser.canImpersonate,
        message: `Server admin access for user ${targetUser.id} changed by ${actor.id}`,
      });
  }

  private toServerAdminDTO(user: UserEntity): ServerAdminDTO {
    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      canAccessFullAdminPanel: user.canAccessFullAdminPanel,
      canImpersonate: user.canImpersonate,
    };
  }
}
