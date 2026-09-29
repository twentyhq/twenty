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
import { isDefined } from 'twenty-shared/utils';
import { IsNull, MoreThan, QueryFailedError, Repository } from 'typeorm';

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
import { TwoFactorAuthenticationRecoveryCodeEntity } from 'src/engine/core-modules/two-factor-authentication/entities/two-factor-authentication-recovery-code.entity';
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
  'id' | 'firstName' | 'lastName' | 'canImpersonate' | 'canAccessFullAdminPanel'
>;

@Injectable()
// oxlint-disable-next-line twenty/inject-workspace-repository
export class TwoFactorAuthenticationRecoveryService {
  private readonly logger = new Logger(
    TwoFactorAuthenticationRecoveryService.name,
  );

  constructor(
    @InjectWorkspaceScopedRepository(TwoFactorAuthenticationRecoveryCodeEntity)
    private readonly twoFactorAuthenticationRecoveryCodeRepository: WorkspaceScopedRepository<TwoFactorAuthenticationRecoveryCodeEntity>,
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
    await this.throttlerService.atomicTokenBucketThrottleOrThrow({
      key: buildTwoFactorAuthenticationRecoveryCodeIssuanceRateLimitKey({
        actorUserId: actor.id,
      }),
      maxTokens:
        TWO_FACTOR_AUTHENTICATION_RECOVERY_CODE_ISSUANCE_RATE_LIMIT_MAX,
      timeWindow:
        TWO_FACTOR_AUTHENTICATION_RECOVERY_CODE_ISSUANCE_RATE_LIMIT_WINDOW_MS,
    });

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

    const targetUserWorkspace = await this.getTargetUserWorkspaceOrThrow({
      targetUserId,
      targetWorkspaceId,
    });

    this.assertActorCanManageRecoveryCodesForTargetOrThrow({
      actor,
      targetUserWorkspace,
    });

    const hasVerifiedTwoFactorAuthenticationMethod =
      await this.twoFactorAuthenticationMethodRepository.exists(
        targetWorkspaceId,
        {
          where: {
            userWorkspaceId: targetUserWorkspace.id,
            status: OTPStatus.VERIFIED,
          },
        },
      );

    if (!hasVerifiedTwoFactorAuthenticationMethod) {
      throw new TwoFactorAuthenticationException(
        'The member has no verified two-factor authentication method',
        TwoFactorAuthenticationExceptionCode.RECOVERY_CODE_TARGET_NOT_ALLOWED,
        {
          userFriendlyMessage: msg`This member hasn't set up two-factor authentication, so there is nothing to recover.`,
        },
      );
    }

    await this.twoFactorAuthenticationService.revokePendingRecoveryCodes({
      workspaceId: targetWorkspaceId,
      userWorkspaceId: targetUserWorkspace.id,
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

    // The partial unique index allows one pending code per member, so when two
    // admins issue at the same time only the first insert succeeds.
    try {
      await this.twoFactorAuthenticationRecoveryCodeRepository.insert(
        targetWorkspaceId,
        {
          userWorkspaceId: targetUserWorkspace.id,
          codeHash: hashTwoFactorAuthenticationRecoveryCode(recoveryCode),
          issuedByUserId: actor.id,
          expiresAt,
        },
      );
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

    this.twoFactorAuthenticationService.emitTwoFactorAuthenticationEvent({
      workspaceId: targetWorkspaceId,
      userId: actor.id,
      action: 'recovery_code_issued',
      targetUserId,
    });

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
    const targetUserWorkspace = await this.getTargetUserWorkspaceOrThrow({
      targetUserId,
      targetWorkspaceId,
    });

    this.assertActorCanManageRecoveryCodesForTargetOrThrow({
      actor,
      targetUserWorkspace,
    });

    const revokedCount =
      await this.twoFactorAuthenticationService.revokePendingRecoveryCodes({
        workspaceId: targetWorkspaceId,
        userWorkspaceId: targetUserWorkspace.id,
      });

    if (revokedCount > 0) {
      this.twoFactorAuthenticationService.emitTwoFactorAuthenticationEvent({
        workspaceId: targetWorkspaceId,
        userId: actor.id,
        action: 'recovery_code_revoked',
        targetUserId,
      });
    }

    return revokedCount > 0;
  }

  async getRecoveryStatus({
    targetUserId,
    targetWorkspaceId,
  }: {
    targetUserId: UserEntity['id'];
    targetWorkspaceId: WorkspaceEntity['id'];
  }): Promise<{
    hasVerifiedTwoFactorAuthenticationMethod: boolean;
    pendingRecoveryCodeExpiresAt: Date | null;
  }> {
    const targetUserWorkspace = await this.getTargetUserWorkspaceOrThrow({
      targetUserId,
      targetWorkspaceId,
    });

    const hasVerifiedTwoFactorAuthenticationMethod =
      await this.twoFactorAuthenticationMethodRepository.exists(
        targetWorkspaceId,
        {
          where: {
            userWorkspaceId: targetUserWorkspace.id,
            status: OTPStatus.VERIFIED,
          },
        },
      );

    const pendingRecoveryCode =
      await this.twoFactorAuthenticationRecoveryCodeRepository.findOne(
        targetWorkspaceId,
        {
          where: {
            userWorkspaceId: targetUserWorkspace.id,
            usedAt: IsNull(),
            revokedAt: IsNull(),
            expiresAt: MoreThan(new Date()),
          },
          order: { createdAt: 'DESC' },
        },
      );

    return {
      hasVerifiedTwoFactorAuthenticationMethod,
      pendingRecoveryCodeExpiresAt: pendingRecoveryCode?.expiresAt ?? null,
    };
  }

  async redeemRecoveryCode({
    userId,
    workspace,
    recoveryCode,
  }: {
    userId: UserEntity['id'];
    workspace: Pick<WorkspaceEntity, 'id' | 'displayName'>;
    recoveryCode: string;
  }): Promise<void> {
    const userWorkspace = await this.getTargetUserWorkspaceOrThrow({
      targetUserId: userId,
      targetWorkspaceId: workspace.id,
    });

    await this.throttlerService.atomicTokenBucketThrottleOrThrow({
      key: buildTwoFactorAuthenticationRecoveryCodeRedemptionRateLimitKey({
        userWorkspaceId: userWorkspace.id,
      }),
      maxTokens:
        TWO_FACTOR_AUTHENTICATION_RECOVERY_CODE_REDEMPTION_RATE_LIMIT_MAX,
      timeWindow:
        TWO_FACTOR_AUTHENTICATION_RECOVERY_CODE_REDEMPTION_RATE_LIMIT_WINDOW_MS,
    });

    const redeemableCodeWhere = {
      userWorkspaceId: userWorkspace.id,
      codeHash: hashTwoFactorAuthenticationRecoveryCode(recoveryCode),
      usedAt: IsNull(),
      revokedAt: IsNull(),
      expiresAt: MoreThan(new Date()),
    };

    const isRedeemable =
      await this.twoFactorAuthenticationRecoveryCodeRepository.exists(
        workspace.id,
        { where: redeemableCodeWhere },
      );

    if (!isRedeemable) {
      this.rejectRecoveryCode({ userId, workspaceId: workspace.id });
    }

    // Sessions live partly in the cache, so they are revoked before the code
    // is consumed: if this fails the code stays usable and the member retries.
    await this.userSessionService.revokeAllSessionsForUser({
      userId,
      workspaceId: workspace.id,
      reason: UserSessionRevokedReason.TwoFactorAuthenticationReset,
    });

    const isConsumed = await this.appTokenRepository.manager.transaction(
      async (entityManager) => {
        // The conditional UPDATE is what makes a code single use: when two
        // requests race, Postgres re-checks the WHERE clause for the second
        // one after the first commits, so only one of them affects the row.
        const consumeResult = await entityManager
          .getRepository(TwoFactorAuthenticationRecoveryCodeEntity)
          .update(
            { ...redeemableCodeWhere, workspaceId: workspace.id },
            { usedAt: new Date() },
          );

        if ((consumeResult.affected ?? 0) === 0) {
          return false;
        }

        await entityManager
          .getRepository(TwoFactorAuthenticationMethodEntity)
          .delete({
            workspaceId: workspace.id,
            userWorkspaceId: userWorkspace.id,
          });

        await entityManager.getRepository(AppTokenEntity).update(
          {
            userId,
            workspaceId: workspace.id,
            type: AppTokenType.RefreshToken,
            revokedAt: IsNull(),
          },
          { revokedAt: new Date() },
        );

        return true;
      },
    );

    if (!isConsumed) {
      this.rejectRecoveryCode({ userId, workspaceId: workspace.id });
    }

    this.twoFactorAuthenticationService.emitTwoFactorAuthenticationEvent({
      workspaceId: workspace.id,
      userId,
      action: 'recovery_code_used',
    });

    await this.sendTwoFactorAuthenticationResetEmail({
      userWorkspace,
      workspaceDisplayName: workspace.displayName,
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

  private rejectRecoveryCode({
    userId,
    workspaceId,
  }: {
    userId: UserEntity['id'];
    workspaceId: WorkspaceEntity['id'];
  }): never {
    this.twoFactorAuthenticationService.emitTwoFactorAuthenticationEvent({
      workspaceId,
      userId,
      action: 'recovery_code_rejected',
    });

    throw new TwoFactorAuthenticationException(
      'Invalid recovery code',
      TwoFactorAuthenticationExceptionCode.INVALID_RECOVERY_CODE,
    );
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
          actorName: `${actor.firstName} ${actor.lastName}`.trim(),
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

  // Notification failures must not undo or block the security action that
  // already happened, so they are logged instead of thrown.
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
