import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';
import ms from 'ms';
import {
  TwoFactorAuthenticationRecoveryCodeIssuedEmail,
  TwoFactorAuthenticationResetEmail,
  renderEmail,
} from 'twenty-emails';
import { SOURCE_LOCALE } from 'twenty-shared/translations';
import { TwoFactorAuthenticationStrategy } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import {
  IsNull,
  MoreThan,
  MoreThanOrEqual,
  Not,
  QueryFailedError,
  Repository,
} from 'typeorm';

import { POSTGRESQL_ERROR_CODES } from 'src/engine/api/graphql/workspace-query-runner/constants/postgres-error-codes.constants';
import { type QueryFailedErrorWithCode } from 'src/engine/api/graphql/workspace-query-runner/utils/workspace-query-runner-graphql-api-exception-handler.util';
import {
  AppTokenEntity,
  AppTokenType,
} from 'src/engine/core-modules/app-token/app-token.entity';
import { type AuthContextUser } from 'src/engine/core-modules/auth/types/auth-context.type';
import { EmailService } from 'src/engine/core-modules/email/email.service';
import { I18nService } from 'src/engine/core-modules/i18n/i18n.service';
import { userHasAdminPrivileges } from 'src/engine/core-modules/impersonation/utils/user-has-admin-privileges.util';
import { ThrottlerService } from 'src/engine/core-modules/throttler/throttler.service';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import {
  TWO_FACTOR_AUTHENTICATION_RECOVERY_CODE_ISSUANCE_RATE_LIMIT_MAX,
  TWO_FACTOR_AUTHENTICATION_RECOVERY_CODE_ISSUANCE_RATE_LIMIT_WINDOW_MS,
  TWO_FACTOR_AUTHENTICATION_RECOVERY_CODE_REDEMPTION_RATE_LIMIT_MAX,
  TWO_FACTOR_AUTHENTICATION_RECOVERY_CODE_REDEMPTION_RATE_LIMIT_WINDOW_MS,
} from 'src/engine/core-modules/two-factor-authentication/constants/two-factor-authentication-recovery-code.constant';
import { TwoFactorAuthenticationMethodEntity } from 'src/engine/core-modules/two-factor-authentication/entities/two-factor-authentication-method.entity';
import { OTPStatus } from 'src/engine/core-modules/two-factor-authentication/strategies/otp/otp.constants';
import {
  TwoFactorAuthenticationException,
  TwoFactorAuthenticationExceptionCode,
} from 'src/engine/core-modules/two-factor-authentication/two-factor-authentication.exception';
import { TwoFactorAuthenticationService } from 'src/engine/core-modules/two-factor-authentication/two-factor-authentication.service';
import { buildTwoFactorAuthenticationRecoveryCodeIssuanceRateLimitKey } from 'src/engine/core-modules/two-factor-authentication/utils/build-two-factor-authentication-recovery-code-issuance-rate-limit-key.util';
import { buildTwoFactorAuthenticationRecoveryCodeRedemptionRateLimitKey } from 'src/engine/core-modules/two-factor-authentication/utils/build-two-factor-authentication-recovery-code-redemption-rate-limit-key.util';
import { generateTwoFactorAuthenticationRecoveryCode } from 'src/engine/core-modules/two-factor-authentication/utils/generate-two-factor-authentication-recovery-code.util';
import { hashTwoFactorAuthenticationRecoveryCode } from 'src/engine/core-modules/two-factor-authentication/utils/hash-two-factor-authentication-recovery-code.util';
import { UserSessionService } from 'src/engine/core-modules/user-session/services/user-session.service';
import { UserSessionRevokedReason } from 'src/engine/core-modules/user-session/types/user-session-revoked-reason.type';
import { type UserWorkspaceEntity } from 'src/engine/core-modules/user-workspace/user-workspace.entity';
import { UserWorkspaceService } from 'src/engine/core-modules/user-workspace/user-workspace.service';
import { type UserEntity } from 'src/engine/core-modules/user/user.entity';
import { type WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { InjectWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/inject-workspace-scoped-repository.decorator';
import { WorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/workspace-scoped-repository';

type RecoveryCodeActor = Pick<
  AuthContextUser,
  | 'id'
  | 'email'
  | 'firstName'
  | 'lastName'
  | 'canImpersonate'
  | 'canAccessFullAdminPanel'
>;

@Injectable()
// oxlint-disable-next-line twenty/inject-workspace-repository
export class TwoFactorAuthenticationRecoveryService {
  private readonly logger = new Logger(
    TwoFactorAuthenticationRecoveryService.name,
  );

  constructor(
    @InjectWorkspaceScopedRepository(TwoFactorAuthenticationMethodEntity)
    private readonly twoFactorAuthenticationMethodRepository: WorkspaceScopedRepository<TwoFactorAuthenticationMethodEntity>,
    @InjectRepository(AppTokenEntity)
    private readonly appTokenRepository: Repository<AppTokenEntity>,
    private readonly twoFactorAuthenticationService: TwoFactorAuthenticationService,
    private readonly userWorkspaceService: UserWorkspaceService,
    private readonly userSessionService: UserSessionService,
    private readonly throttlerService: ThrottlerService,
    private readonly emailService: EmailService,
    private readonly i18nService: I18nService,
    private readonly twentyConfigService: TwentyConfigService,
  ) {}

  async generateRecoveryCode({
    actor,
    actorWorkspaceId,
    otp,
    targetUserId,
    targetWorkspaceId,
  }: {
    actor: RecoveryCodeActor;
    actorWorkspaceId: WorkspaceEntity['id'];
    otp?: string;
    targetUserId: UserEntity['id'];
    targetWorkspaceId: WorkspaceEntity['id'];
  }): Promise<{ recoveryCode: string; expiresAt: Date }> {
    await this.throttlerService.tokenBucketThrottleOrThrow(
      buildTwoFactorAuthenticationRecoveryCodeIssuanceRateLimitKey({
        actorUserId: actor.id,
      }),
      1,
      TWO_FACTOR_AUTHENTICATION_RECOVERY_CODE_ISSUANCE_RATE_LIMIT_MAX,
      TWO_FACTOR_AUTHENTICATION_RECOVERY_CODE_ISSUANCE_RATE_LIMIT_WINDOW_MS,
    );

    if (actor.id === targetUserId) {
      throw new TwoFactorAuthenticationException(
        'A recovery code cannot be generated for yourself',
        TwoFactorAuthenticationExceptionCode.RECOVERY_CODE_TARGET_NOT_ALLOWED,
        {
          userFriendlyMessage: msg`You can't generate a recovery code for yourself. Reset two-factor authentication from your profile instead.`,
        },
      );
    }

    await this.twoFactorAuthenticationService.assertFreshStepUpAuthenticationOrThrow(
      {
        userId: actor.id,
        workspaceId: actorWorkspaceId,
        otp,
        otpRequiredMessage: msg`Enter your two-factor authentication code to generate a recovery code.`,
        twoFactorAuthenticationRequiredMessage: msg`Set up two-factor authentication on your own account before generating a recovery code.`,
      },
    );

    const targetUserWorkspace =
      await this.getManageableTargetUserWorkspaceOrThrow({
        actor,
        targetUserId,
        targetWorkspaceId,
      });

    const hasRecoverableTwoFactorAuthentication =
      (await this.hasVerifiedTwoFactorAuthenticationMethod(
        targetUserWorkspace,
      )) || (await this.isAwaitingRecoveryEnrollment(targetUserWorkspace));

    if (!hasRecoverableTwoFactorAuthentication) {
      throw new TwoFactorAuthenticationException(
        'The member has no verified two-factor authentication method',
        TwoFactorAuthenticationExceptionCode.RECOVERY_CODE_TARGET_NOT_ALLOWED,
        {
          userFriendlyMessage: msg`This member hasn't set up two-factor authentication, so there is nothing to recover.`,
        },
      );
    }

    await this.twoFactorAuthenticationService.revokeRecoveryCodes({
      workspaceId: targetWorkspaceId,
      userId: targetUserId,
    });

    const recoveryCode = generateTwoFactorAuthenticationRecoveryCode();
    const expiresAt = new Date(
      Date.now() +
        ms(
          this.twentyConfigService.get(
            'TWO_FACTOR_AUTHENTICATION_RECOVERY_CODE_EXPIRES_IN',
          ),
        ),
    );

    try {
      await this.appTokenRepository.insert({
        userId: targetUserId,
        workspaceId: targetWorkspaceId,
        type: AppTokenType.TwoFactorAuthenticationRecoveryCode,
        value: hashTwoFactorAuthenticationRecoveryCode(recoveryCode),
        expiresAt,
        context: { issuedByUserId: actor.id },
      });
    } catch (error) {
      if (
        error instanceof QueryFailedError &&
        (error as QueryFailedErrorWithCode).code ===
          POSTGRESQL_ERROR_CODES.UNIQUE_VIOLATION
      ) {
        throw new TwoFactorAuthenticationException(
          'A recovery code was issued concurrently for this member',
          TwoFactorAuthenticationExceptionCode.RECOVERY_CODE_ISSUANCE_CONFLICT,
        );
      }

      throw error;
    }

    await this.sendRecoveryCodeIssuedEmail({
      actor,
      targetUserWorkspace,
      expiresAt,
    });

    return { recoveryCode, expiresAt };
  }

  async revokeRecoveryCode({
    actor,
    targetUserId,
    targetWorkspaceId,
  }: {
    actor: RecoveryCodeActor;
    targetUserId: UserEntity['id'];
    targetWorkspaceId: WorkspaceEntity['id'];
  }): Promise<boolean> {
    const targetUserWorkspace =
      await this.getManageableTargetUserWorkspaceOrThrow({
        actor,
        targetUserId,
        targetWorkspaceId,
      });

    const revokedCount =
      await this.twoFactorAuthenticationService.revokeRecoveryCodes({
        workspaceId: targetWorkspaceId,
        userId: targetUserWorkspace.userId,
      });

    return revokedCount > 0;
  }

  async getRecoveryStatus({
    actor,
    targetUserId,
    targetWorkspaceId,
  }: {
    actor: RecoveryCodeActor;
    targetUserId: UserEntity['id'];
    targetWorkspaceId: WorkspaceEntity['id'];
  }): Promise<{
    hasVerifiedTwoFactorAuthenticationMethod: boolean;
    isAwaitingRecoveryEnrollment: boolean;
    pendingRecoveryCodeExpiresAt: Date | null;
  }> {
    const targetUserWorkspace =
      await this.getManageableTargetUserWorkspaceOrThrow({
        actor,
        targetUserId,
        targetWorkspaceId,
      });

    const hasVerifiedTwoFactorAuthenticationMethod =
      await this.hasVerifiedTwoFactorAuthenticationMethod(targetUserWorkspace);

    const isAwaitingRecoveryEnrollment =
      !hasVerifiedTwoFactorAuthenticationMethod &&
      (await this.isAwaitingRecoveryEnrollment(targetUserWorkspace));

    const pendingRecoveryCode = await this.appTokenRepository.findOne({
      where: {
        userId: targetUserWorkspace.userId,
        workspaceId: targetWorkspaceId,
        type: AppTokenType.TwoFactorAuthenticationRecoveryCode,
        deletedAt: IsNull(),
        revokedAt: IsNull(),
        expiresAt: MoreThan(new Date()),
      },
    });

    return {
      hasVerifiedTwoFactorAuthenticationMethod,
      isAwaitingRecoveryEnrollment,
      pendingRecoveryCodeExpiresAt: pendingRecoveryCode?.expiresAt ?? null,
    };
  }

  async redeemRecoveryCode({
    userId,
    userEmail,
    workspace,
    recoveryCode,
  }: {
    userId: UserEntity['id'];
    userEmail: string;
    workspace: Pick<
      WorkspaceEntity,
      'id' | 'displayName' | 'isTwoFactorAuthenticationEnforced'
    >;
    recoveryCode: string;
  }): Promise<{ provisioningUri: string | null }> {
    const userWorkspace = await this.getTargetUserWorkspaceOrThrow({
      targetUserId: userId,
      targetWorkspaceId: workspace.id,
    });

    await this.throttlerService.tokenBucketThrottleOrThrow(
      buildTwoFactorAuthenticationRecoveryCodeRedemptionRateLimitKey({
        userWorkspaceId: userWorkspace.id,
      }),
      1,
      TWO_FACTOR_AUTHENTICATION_RECOVERY_CODE_REDEMPTION_RATE_LIMIT_MAX,
      TWO_FACTOR_AUTHENTICATION_RECOVERY_CODE_REDEMPTION_RATE_LIMIT_WINDOW_MS,
    );

    const redemption = await this.appTokenRepository.manager.transaction(
      async (entityManager) => {
        const appTokenRepository = entityManager.getRepository(AppTokenEntity);

        // A redeemed code stays unrevoked only while it reserves enrollment for the authenticator it issued
        const consumeResult = await appTokenRepository.update(
          {
            userId,
            workspaceId: workspace.id,
            type: AppTokenType.TwoFactorAuthenticationRecoveryCode,
            value: hashTwoFactorAuthenticationRecoveryCode(recoveryCode),
            deletedAt: IsNull(),
            revokedAt: IsNull(),
            expiresAt: MoreThan(new Date()),
            createdAt: MoreThanOrEqual(userWorkspace.createdAt),
          },
          workspace.isTwoFactorAuthenticationEnforced
            ? { deletedAt: new Date() }
            : { deletedAt: new Date(), revokedAt: new Date() },
        );

        if ((consumeResult.affected ?? 0) === 0) {
          return null;
        }

        const twoFactorAuthenticationMethodRepository =
          entityManager.getRepository(TwoFactorAuthenticationMethodEntity);

        await twoFactorAuthenticationMethodRepository.delete({
          workspaceId: workspace.id,
          userWorkspaceId: userWorkspace.id,
        });

        await appTokenRepository
          .createQueryBuilder()
          .update()
          .set({
            revokedAt: new Date(),
            context: () =>
              `COALESCE("context", '{}'::jsonb) || jsonb_build_object('revokedReason', :revokedReason::text)`,
          })
          .where({
            userId,
            workspaceId: workspace.id,
            type: AppTokenType.RefreshToken,
            revokedAt: IsNull(),
          })
          .setParameters({
            revokedReason:
              UserSessionRevokedReason.TwoFactorAuthenticationReset,
          })
          .execute();

        if (!workspace.isTwoFactorAuthenticationEnforced) {
          return { provisioningUri: null };
        }

        const { uri, encryptedSecret, status } =
          this.twoFactorAuthenticationService.generatePendingTotpSecret({
            userEmail,
            workspaceId: workspace.id,
            workspaceDisplayName: workspace.displayName,
          });

        await twoFactorAuthenticationMethodRepository.insert({
          workspaceId: workspace.id,
          userWorkspaceId: userWorkspace.id,
          secret: encryptedSecret,
          status,
          strategy: TwoFactorAuthenticationStrategy.TOTP,
        });

        return { provisioningUri: uri };
      },
    );

    if (!isDefined(redemption)) {
      throw new TwoFactorAuthenticationException(
        'Invalid recovery code',
        TwoFactorAuthenticationExceptionCode.INVALID_RECOVERY_CODE,
      );
    }

    await this.userSessionService.revokeAllSessionsForUser({
      userId,
      workspaceId: workspace.id,
      reason: UserSessionRevokedReason.TwoFactorAuthenticationReset,
    });

    await this.sendTwoFactorAuthenticationResetEmail({
      userWorkspace,
      workspaceDisplayName: workspace.displayName,
    });

    return redemption;
  }

  async assertEnrollmentNotReservedForRecoveryOrThrow({
    userId,
    workspaceId,
  }: {
    userId: UserEntity['id'];
    workspaceId: WorkspaceEntity['id'];
  }): Promise<void> {
    const userWorkspace =
      await this.userWorkspaceService.getUserWorkspaceForUser({
        userId,
        workspaceId,
      });

    if (
      !isDefined(userWorkspace) ||
      (await this.hasVerifiedTwoFactorAuthenticationMethod(userWorkspace))
    ) {
      return;
    }

    if (await this.isAwaitingRecoveryEnrollment(userWorkspace)) {
      throw new TwoFactorAuthenticationException(
        'Enrollment after a recovery must use the authenticator issued with the recovery code',
        TwoFactorAuthenticationExceptionCode.RECOVERY_ENROLLMENT_RESTRICTED,
      );
    }
  }

  private isAwaitingRecoveryEnrollment(
    userWorkspace: Pick<
      UserWorkspaceEntity,
      'userId' | 'workspaceId' | 'createdAt'
    >,
  ): Promise<boolean> {
    return this.appTokenRepository.exists({
      where: {
        userId: userWorkspace.userId,
        workspaceId: userWorkspace.workspaceId,
        type: AppTokenType.TwoFactorAuthenticationRecoveryCode,
        deletedAt: Not(IsNull()),
        revokedAt: IsNull(),
        createdAt: MoreThanOrEqual(userWorkspace.createdAt),
      },
    });
  }

  private async getTargetUserWorkspaceOrThrow({
    targetUserId,
    targetWorkspaceId,
  }: {
    targetUserId: UserEntity['id'];
    targetWorkspaceId: WorkspaceEntity['id'];
  }): Promise<UserWorkspaceEntity> {
    const userWorkspace =
      await this.userWorkspaceService.getUserWorkspaceForUser({
        userId: targetUserId,
        workspaceId: targetWorkspaceId,
        relations: ['user', 'workspace'],
      });

    if (!isDefined(userWorkspace)) {
      throw new TwoFactorAuthenticationException(
        'The user is not a member of this workspace',
        TwoFactorAuthenticationExceptionCode.RECOVERY_CODE_TARGET_NOT_ALLOWED,
        {
          userFriendlyMessage: msg`This user is not a member of the workspace.`,
        },
      );
    }

    return userWorkspace;
  }

  private async getManageableTargetUserWorkspaceOrThrow({
    actor,
    targetUserId,
    targetWorkspaceId,
  }: {
    actor: RecoveryCodeActor;
    targetUserId: UserEntity['id'];
    targetWorkspaceId: WorkspaceEntity['id'];
  }): Promise<UserWorkspaceEntity> {
    const targetUserWorkspace = await this.getTargetUserWorkspaceOrThrow({
      targetUserId,
      targetWorkspaceId,
    });

    this.assertActorCanManageRecoveryCodesForTargetOrThrow({
      actor,
      targetUserWorkspace,
    });

    return targetUserWorkspace;
  }

  private hasVerifiedTwoFactorAuthenticationMethod(
    userWorkspace: Pick<UserWorkspaceEntity, 'id' | 'workspaceId'>,
  ): Promise<boolean> {
    return this.twoFactorAuthenticationMethodRepository.exists(
      userWorkspace.workspaceId,
      {
        where: {
          userWorkspaceId: userWorkspace.id,
          status: OTPStatus.VERIFIED,
        },
      },
    );
  }

  private assertActorCanManageRecoveryCodesForTargetOrThrow({
    actor,
    targetUserWorkspace,
  }: {
    actor: RecoveryCodeActor;
    targetUserWorkspace: UserWorkspaceEntity;
  }): void {
    if (
      userHasAdminPrivileges(targetUserWorkspace.user) &&
      !userHasAdminPrivileges(actor)
    ) {
      throw new TwoFactorAuthenticationException(
        'Only a server administrator can manage recovery codes for a server administrator',
        TwoFactorAuthenticationExceptionCode.RECOVERY_CODE_TARGET_NOT_ALLOWED,
        {
          userFriendlyMessage: msg`Only a server administrator can manage recovery codes for this member.`,
        },
      );
    }
  }

  private async sendRecoveryCodeIssuedEmail({
    actor,
    targetUserWorkspace,
    expiresAt,
  }: {
    actor: RecoveryCodeActor;
    targetUserWorkspace: UserWorkspaceEntity;
    expiresAt: Date;
  }): Promise<void> {
    const locale = targetUserWorkspace.locale ?? SOURCE_LOCALE;

    await this.sendSecurityEmail({
      to: targetUserWorkspace.user.email,
      locale,
      subject: msg`A two-factor authentication recovery code was generated for you`,
      buildEmailTemplate: () =>
        TwoFactorAuthenticationRecoveryCodeIssuedEmail({
          actorName:
            `${actor.firstName} ${actor.lastName}`.trim() || actor.email,
          workspaceDisplayName: targetUserWorkspace.workspace.displayName ?? '',
          expiresAt,
          locale,
        }),
    });
  }

  private async sendTwoFactorAuthenticationResetEmail({
    userWorkspace,
    workspaceDisplayName,
  }: {
    userWorkspace: UserWorkspaceEntity;
    workspaceDisplayName: WorkspaceEntity['displayName'];
  }): Promise<void> {
    const locale = userWorkspace.locale ?? SOURCE_LOCALE;

    await this.sendSecurityEmail({
      to: userWorkspace.user.email,
      locale,
      subject: msg`Your two-factor authentication was reset`,
      buildEmailTemplate: () =>
        TwoFactorAuthenticationResetEmail({
          workspaceDisplayName: workspaceDisplayName ?? '',
          locale,
        }),
    });
  }

  private async sendSecurityEmail({
    to,
    locale,
    subject,
    buildEmailTemplate,
  }: {
    to: string;
    locale: UserWorkspaceEntity['locale'];
    subject: MessageDescriptor;
    buildEmailTemplate: () => Parameters<typeof renderEmail>[0];
  }): Promise<void> {
    try {
      const emailTemplate = buildEmailTemplate();
      const html = await renderEmail(emailTemplate, { pretty: true });
      const text = await renderEmail(emailTemplate, { plainText: true });
      const i18n = this.i18nService.getI18nInstance(locale);

      await this.emailService.send({
        from: `${this.twentyConfigService.get('EMAIL_FROM_NAME')} <${this.twentyConfigService.get('EMAIL_FROM_ADDRESS')}>`,
        to,
        subject: i18n._(subject),
        text,
        html,
      });
    } catch (error) {
      this.logger.error(
        'Failed to send a two-factor authentication recovery email',
        error,
      );
    }
  }
}
