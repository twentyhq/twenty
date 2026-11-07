import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { msg } from '@lingui/core/macro';
import { isDefined } from 'twenty-shared/utils';
import {
  type EntityManager,
  IsNull,
  MoreThanOrEqual,
  Repository,
} from 'typeorm';

import {
  AppTokenEntity,
  AppTokenType,
} from 'src/engine/core-modules/app-token/app-token.entity';
import { acquireUserAuthenticationLock } from 'src/engine/core-modules/auth/utils/acquire-user-authentication-lock.util';
import {
  TWO_FACTOR_AUTHENTICATION_BACKUP_CODE_COUNT,
  TWO_FACTOR_AUTHENTICATION_BACKUP_CODE_EXPIRES_AT,
} from 'src/engine/core-modules/two-factor-authentication/constants/two-factor-authentication-backup-code.constant';
import { TwoFactorAuthenticationMethodEntity } from 'src/engine/core-modules/two-factor-authentication/entities/two-factor-authentication-method.entity';
import { OTPStatus } from 'src/engine/core-modules/two-factor-authentication/strategies/otp/otp.constants';
import {
  TwoFactorAuthenticationException,
  TwoFactorAuthenticationExceptionCode,
} from 'src/engine/core-modules/two-factor-authentication/two-factor-authentication.exception';
import { TwoFactorAuthenticationService } from 'src/engine/core-modules/two-factor-authentication/two-factor-authentication.service';
import { generateTwoFactorAuthenticationRecoveryCode } from 'src/engine/core-modules/two-factor-authentication/utils/generate-two-factor-authentication-recovery-code.util';
import { hashTwoFactorAuthenticationRecoveryCode } from 'src/engine/core-modules/two-factor-authentication/utils/hash-two-factor-authentication-recovery-code.util';
import { type UserWorkspaceEntity } from 'src/engine/core-modules/user-workspace/user-workspace.entity';
import { UserWorkspaceService } from 'src/engine/core-modules/user-workspace/user-workspace.service';
import { type UserEntity } from 'src/engine/core-modules/user/user.entity';
import { type WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';

@Injectable()
// oxlint-disable-next-line twenty/inject-workspace-repository
export class TwoFactorAuthenticationBackupCodeService {
  constructor(
    @InjectRepository(AppTokenEntity)
    private readonly appTokenRepository: Repository<AppTokenEntity>,
    private readonly twoFactorAuthenticationService: TwoFactorAuthenticationService,
    private readonly userWorkspaceService: UserWorkspaceService,
  ) {}

  async issueBackupCodesOrThrow({
    userId,
    workspaceId,
    twoFactorAuthenticationMethodId,
  }: {
    userId: UserEntity['id'];
    workspaceId: WorkspaceEntity['id'];
    twoFactorAuthenticationMethodId: TwoFactorAuthenticationMethodEntity['id'];
  }): Promise<string[]> {
    const backupCodes = Array.from(
      { length: TWO_FACTOR_AUTHENTICATION_BACKUP_CODE_COUNT },
      () => generateTwoFactorAuthenticationRecoveryCode(),
    );

    await this.appTokenRepository.manager.transaction(async (entityManager) => {
      await acquireUserAuthenticationLock({
        entityManager,
        userId,
        mode: 'exclusive',
      });

      const isAuthenticatorStillVerified = await entityManager
        .getRepository(TwoFactorAuthenticationMethodEntity)
        .exists({
          where: {
            id: twoFactorAuthenticationMethodId,
            workspaceId,
            status: OTPStatus.VERIFIED,
          },
        });

      if (!isAuthenticatorStillVerified) {
        throw new TwoFactorAuthenticationException(
          'The two-factor authentication method changed before backup codes were issued',
          TwoFactorAuthenticationExceptionCode.INVALID_CONFIGURATION,
          {
            userFriendlyMessage: msg`Your two-factor authentication changed. Generate backup codes again.`,
          },
        );
      }

      await this.revokeBackupCodes({ userId, workspaceId, entityManager });

      await entityManager.getRepository(AppTokenEntity).insert(
        backupCodes.map((backupCode) => ({
          userId,
          workspaceId,
          type: AppTokenType.TwoFactorAuthenticationBackupCode,
          value: hashTwoFactorAuthenticationRecoveryCode(backupCode),
          expiresAt: TWO_FACTOR_AUTHENTICATION_BACKUP_CODE_EXPIRES_AT,
        })),
      );
    });

    return backupCodes;
  }

  async regenerateBackupCodesOrThrow({
    userId,
    workspaceId,
    otp,
  }: {
    userId: UserEntity['id'];
    workspaceId: WorkspaceEntity['id'];
    otp?: string;
  }): Promise<string[]> {
    const { twoFactorAuthenticationMethodId } =
      await this.twoFactorAuthenticationService.assertFreshStepUpAuthenticationOrThrow(
        {
          userId,
          workspaceId,
          otp,
          otpRequiredMessage: msg`Enter your two-factor authentication code to generate new backup codes.`,
          twoFactorAuthenticationRequiredMessage: msg`Set up two-factor authentication before generating backup codes.`,
        },
      );

    return this.issueBackupCodesOrThrow({
      userId,
      workspaceId,
      twoFactorAuthenticationMethodId,
    });
  }

  async getRemainingBackupCodeCount({
    userId,
    workspaceId,
  }: {
    userId: UserEntity['id'];
    workspaceId: WorkspaceEntity['id'];
  }): Promise<number> {
    const userWorkspace =
      await this.userWorkspaceService.getUserWorkspaceForUserOrThrow({
        userId,
        workspaceId,
        relations: [],
      });

    return this.appTokenRepository.count({
      where: {
        userId,
        workspaceId,
        type: AppTokenType.TwoFactorAuthenticationBackupCode,
        deletedAt: IsNull(),
        revokedAt: IsNull(),
        createdAt: MoreThanOrEqual(userWorkspace.createdAt),
      },
    });
  }

  async revokeBackupCodes({
    userId,
    workspaceId,
    entityManager,
  }: {
    userId: UserEntity['id'];
    workspaceId: WorkspaceEntity['id'];
    entityManager?: EntityManager;
  }): Promise<void> {
    const appTokenRepository =
      entityManager?.getRepository(AppTokenEntity) ?? this.appTokenRepository;

    await appTokenRepository.update(
      {
        userId,
        workspaceId,
        type: AppTokenType.TwoFactorAuthenticationBackupCode,
        deletedAt: IsNull(),
        revokedAt: IsNull(),
      },
      { revokedAt: new Date() },
    );
  }

  async consumeBackupCode({
    entityManager,
    userWorkspace,
    backupCode,
  }: {
    entityManager: EntityManager;
    userWorkspace: Pick<
      UserWorkspaceEntity,
      'id' | 'userId' | 'workspaceId' | 'createdAt'
    >;
    backupCode: string;
  }): Promise<boolean> {
    const verifiedTwoFactorAuthenticationMethod = await entityManager
      .getRepository(TwoFactorAuthenticationMethodEntity)
      .findOne({
        where: {
          workspaceId: userWorkspace.workspaceId,
          userWorkspaceId: userWorkspace.id,
          status: OTPStatus.VERIFIED,
        },
      });

    if (!isDefined(verifiedTwoFactorAuthenticationMethod)) {
      return false;
    }

    const currentEnrollmentStartedAt = new Date(
      Math.max(
        userWorkspace.createdAt.getTime(),
        verifiedTwoFactorAuthenticationMethod.createdAt.getTime(),
      ),
    );

    const consumeResult = await entityManager
      .getRepository(AppTokenEntity)
      .update(
        {
          userId: userWorkspace.userId,
          workspaceId: userWorkspace.workspaceId,
          type: AppTokenType.TwoFactorAuthenticationBackupCode,
          value: hashTwoFactorAuthenticationRecoveryCode(backupCode),
          deletedAt: IsNull(),
          revokedAt: IsNull(),
          createdAt: MoreThanOrEqual(currentEnrollmentStartedAt),
        },
        { deletedAt: new Date() },
      );

    return (consumeResult.affected ?? 0) > 0;
  }
}
