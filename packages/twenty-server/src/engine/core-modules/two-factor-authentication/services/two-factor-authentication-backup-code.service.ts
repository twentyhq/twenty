import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { msg } from '@lingui/core/macro';
import { isDefined } from 'twenty-shared/utils';
import {
  type EntityManager,
  type FindOptionsWhere,
  IsNull,
  Raw,
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
import { generateTwoFactorAuthenticationRecoveryCode } from 'src/engine/core-modules/two-factor-authentication/utils/generate-two-factor-authentication-recovery-code.util';
import { hashTwoFactorAuthenticationRecoveryCode } from 'src/engine/core-modules/two-factor-authentication/utils/hash-two-factor-authentication-recovery-code.util';
import { revokeTwoFactorAuthenticationAppTokens } from 'src/engine/core-modules/two-factor-authentication/utils/revoke-two-factor-authentication-app-tokens.util';
import { type UserEntity } from 'src/engine/core-modules/user/user.entity';
import { type WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';

@Injectable()
// oxlint-disable-next-line twenty/inject-workspace-repository
export class TwoFactorAuthenticationBackupCodeService {
  constructor(
    @InjectRepository(AppTokenEntity)
    private readonly appTokenRepository: Repository<AppTokenEntity>,
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

      // A stale request must not revoke the codes of an authenticator that replaced this one
      const verifiedTwoFactorAuthenticationMethodId =
        await this.findVerifiedTwoFactorAuthenticationMethodId({
          entityManager,
          userId,
          workspaceId,
        });

      if (
        verifiedTwoFactorAuthenticationMethodId !==
        twoFactorAuthenticationMethodId
      ) {
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
          context: { twoFactorAuthenticationMethodId },
        })),
      );
    });

    return backupCodes;
  }

  async getRemainingBackupCodeCount({
    userId,
    workspaceId,
  }: {
    userId: UserEntity['id'];
    workspaceId: WorkspaceEntity['id'];
  }): Promise<number> {
    const entityManager = this.appTokenRepository.manager;

    const verifiedTwoFactorAuthenticationMethodId =
      await this.findVerifiedTwoFactorAuthenticationMethodId({
        entityManager,
        userId,
        workspaceId,
      });

    if (!isDefined(verifiedTwoFactorAuthenticationMethodId)) {
      return 0;
    }

    return entityManager.getRepository(AppTokenEntity).count({
      where: this.buildActiveBackupCodeWhere({
        userId,
        workspaceId,
        twoFactorAuthenticationMethodId:
          verifiedTwoFactorAuthenticationMethodId,
      }),
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
    await revokeTwoFactorAuthenticationAppTokens({
      appTokenRepository:
        entityManager?.getRepository(AppTokenEntity) ?? this.appTokenRepository,
      userId,
      workspaceId,
      type: AppTokenType.TwoFactorAuthenticationBackupCode,
    });
  }

  async consumeBackupCode({
    entityManager,
    userId,
    workspaceId,
    backupCode,
  }: {
    entityManager: EntityManager;
    userId: UserEntity['id'];
    workspaceId: WorkspaceEntity['id'];
    backupCode: string;
  }): Promise<boolean> {
    const verifiedTwoFactorAuthenticationMethodId =
      await this.findVerifiedTwoFactorAuthenticationMethodId({
        entityManager,
        userId,
        workspaceId,
      });

    if (!isDefined(verifiedTwoFactorAuthenticationMethodId)) {
      return false;
    }

    const consumeResult = await entityManager
      .getRepository(AppTokenEntity)
      .update(
        {
          ...this.buildActiveBackupCodeWhere({
            userId,
            workspaceId,
            twoFactorAuthenticationMethodId:
              verifiedTwoFactorAuthenticationMethodId,
          }),
          value: hashTwoFactorAuthenticationRecoveryCode(backupCode),
        },
        { deletedAt: new Date() },
      );

    return (consumeResult.affected ?? 0) > 0;
  }

  private async findVerifiedTwoFactorAuthenticationMethodId({
    entityManager,
    userId,
    workspaceId,
  }: {
    entityManager: EntityManager;
    userId: UserEntity['id'];
    workspaceId: WorkspaceEntity['id'];
  }): Promise<TwoFactorAuthenticationMethodEntity['id'] | null> {
    const verifiedTwoFactorAuthenticationMethod = await entityManager
      .getRepository(TwoFactorAuthenticationMethodEntity)
      .findOne({
        select: { id: true },
        where: {
          workspaceId,
          status: OTPStatus.VERIFIED,
          userWorkspace: { userId, workspaceId },
        },
      });

    return verifiedTwoFactorAuthenticationMethod?.id ?? null;
  }

  // A code only works for the authenticator it was issued with, so replacing the authenticator retires its codes
  private buildActiveBackupCodeWhere({
    userId,
    workspaceId,
    twoFactorAuthenticationMethodId,
  }: {
    userId: UserEntity['id'];
    workspaceId: WorkspaceEntity['id'];
    twoFactorAuthenticationMethodId: TwoFactorAuthenticationMethodEntity['id'];
  }): FindOptionsWhere<AppTokenEntity> {
    return {
      userId,
      workspaceId,
      type: AppTokenType.TwoFactorAuthenticationBackupCode,
      deletedAt: IsNull(),
      revokedAt: IsNull(),
      context: Raw(
        (alias) =>
          `${alias} ->> 'twoFactorAuthenticationMethodId' = :twoFactorAuthenticationMethodId`,
        { twoFactorAuthenticationMethodId },
      ),
    };
  }
}
