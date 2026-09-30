import { Injectable } from '@nestjs/common';

import { type MessageDescriptor } from '@lingui/core';
import { isNonEmptyString } from '@sniptt/guards';
import { authenticator } from 'otplib';
import { TwoFactorAuthenticationStrategy } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { IsNull } from 'typeorm';

import {
  AuthException,
  AuthExceptionCode,
} from 'src/engine/core-modules/auth/auth.exception';
import { type EncryptedString } from 'src/engine/core-modules/secret-encryption/branded-strings/encrypted-string.type';
import { type PlaintextString } from 'src/engine/core-modules/secret-encryption/branded-strings/plaintext-string.type';
import { SecretEncryptionService } from 'src/engine/core-modules/secret-encryption/secret-encryption.service';
import { ThrottlerService } from 'src/engine/core-modules/throttler/throttler.service';
import { UserEntity } from 'src/engine/core-modules/user/user.entity';
import {
  TWO_FACTOR_AUTHENTICATION_OTP_RATE_LIMIT_MAX,
  TWO_FACTOR_AUTHENTICATION_OTP_RATE_LIMIT_WINDOW_MS,
} from 'src/engine/core-modules/two-factor-authentication/constants/two-factor-authentication-otp-rate-limit.constant';
import { TwoFactorAuthenticationMethodEntity } from 'src/engine/core-modules/two-factor-authentication/entities/two-factor-authentication-method.entity';
import { TwoFactorAuthenticationRecoveryCodeEntity } from 'src/engine/core-modules/two-factor-authentication/entities/two-factor-authentication-recovery-code.entity';
import { TOTP_DEFAULT_CONFIGURATION } from 'src/engine/core-modules/two-factor-authentication/strategies/otp/totp/constants/totp.strategy.constants';
import { TotpStrategy } from 'src/engine/core-modules/two-factor-authentication/strategies/otp/totp/totp.strategy';
import { buildTwoFactorAuthenticationOtpRateLimitKey } from 'src/engine/core-modules/two-factor-authentication/utils/build-two-factor-authentication-otp-rate-limit-key.util';
import { InjectWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/inject-workspace-scoped-repository.decorator';
import { WorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/workspace-scoped-repository';
import { UserWorkspaceService } from 'src/engine/core-modules/user-workspace/user-workspace.service';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';

import {
  TwoFactorAuthenticationException,
  TwoFactorAuthenticationExceptionCode,
} from './two-factor-authentication.exception';
import { twoFactorAuthenticationMethodsValidator } from './two-factor-authentication.validation';

import { OTPStatus } from './strategies/otp/otp.constants';

const PENDING_METHOD_REUSE_WINDOW_MS = 60 * 60 * 1000;

@Injectable()
// oxlint-disable-next-line twenty/inject-workspace-repository
export class TwoFactorAuthenticationService {
  constructor(
    @InjectWorkspaceScopedRepository(TwoFactorAuthenticationMethodEntity)
    private readonly twoFactorAuthenticationMethodRepository: WorkspaceScopedRepository<TwoFactorAuthenticationMethodEntity>,
    @InjectWorkspaceScopedRepository(TwoFactorAuthenticationRecoveryCodeEntity)
    private readonly twoFactorAuthenticationRecoveryCodeRepository: WorkspaceScopedRepository<TwoFactorAuthenticationRecoveryCodeEntity>,
    private readonly userWorkspaceService: UserWorkspaceService,
    private readonly secretEncryptionService: SecretEncryptionService,
    private readonly throttlerService: ThrottlerService,
  ) {}

  private async decryptStoredSecret({
    storedSecret,
    workspaceId,
  }: {
    storedSecret: EncryptedString;
    workspaceId: string;
  }): Promise<PlaintextString> {
    return this.secretEncryptionService.decryptVersionedOrThrow(storedSecret, {
      workspaceId,
    });
  }

  async validateTwoFactorAuthenticationRequirement(
    targetWorkspace: WorkspaceEntity,
    userTwoFactorAuthenticationMethods?: TwoFactorAuthenticationMethodEntity[],
  ) {
    if (
      twoFactorAuthenticationMethodsValidator.areDefined(
        userTwoFactorAuthenticationMethods,
      ) &&
      twoFactorAuthenticationMethodsValidator.areVerified(
        userTwoFactorAuthenticationMethods,
      )
    ) {
      throw new AuthException(
        'Two factor authentication verification required',
        AuthExceptionCode.TWO_FACTOR_AUTHENTICATION_VERIFICATION_REQUIRED,
      );
    } else if (targetWorkspace?.isTwoFactorAuthenticationEnforced) {
      throw new AuthException(
        'Two factor authentication setup required',
        AuthExceptionCode.TWO_FACTOR_AUTHENTICATION_PROVISION_REQUIRED,
      );
    }
  }

  async initiateStrategyConfiguration(
    userId: string,
    userEmail: string,
    workspaceId: string,
    workspaceDisplayName?: string,
  ) {
    const userWorkspace =
      await this.userWorkspaceService.getUserWorkspaceForUserOrThrow({
        userId,
        workspaceId,
      });

    const existing2FAMethod =
      await this.twoFactorAuthenticationMethodRepository.findOne(workspaceId, {
        where: {
          userWorkspace: { id: userWorkspace.id },
          strategy: TwoFactorAuthenticationStrategy.TOTP,
        },
      });

    if (existing2FAMethod && existing2FAMethod.status !== 'PENDING') {
      throw new TwoFactorAuthenticationException(
        'A two factor authentication method has already been set. Please delete it and try again.',
        TwoFactorAuthenticationExceptionCode.TWO_FACTOR_AUTHENTICATION_METHOD_ALREADY_PROVISIONED,
      );
    }

    if (
      existing2FAMethod &&
      existing2FAMethod.status === 'PENDING' &&
      existing2FAMethod.createdAt &&
      Date.now() - existing2FAMethod.createdAt.getTime() <
        PENDING_METHOD_REUSE_WINDOW_MS
    ) {
      const existingSecret = await this.decryptStoredSecret({
        storedSecret: existing2FAMethod.secret,
        workspaceId,
      });

      const issuer = `Twenty${workspaceDisplayName ? ` - ${workspaceDisplayName}` : ''}`;
      const reuseUri = authenticator.keyuri(userEmail, issuer, existingSecret);

      return reuseUri;
    }

    const { uri, context } = new TotpStrategy(
      TOTP_DEFAULT_CONFIGURATION,
    ).initiate(
      userEmail,
      `Twenty${workspaceDisplayName ? ` - ${workspaceDisplayName}` : ''}`,
    );

    const encryptedSecret = this.secretEncryptionService.encryptVersioned(
      context.secret,
      { workspaceId },
    );

    await this.twoFactorAuthenticationMethodRepository.upsert(
      workspaceId,
      {
        userWorkspaceId: userWorkspace.id,
        secret: encryptedSecret,
        status: context.status,
        strategy: TwoFactorAuthenticationStrategy.TOTP,
      },
      ['userWorkspaceId', 'strategy'],
    );

    return uri;
  }

  async validateStrategy(
    userId: UserEntity['id'],
    token: string,
    workspaceId: WorkspaceEntity['id'],
    twoFactorAuthenticationStrategy: TwoFactorAuthenticationStrategy,
  ) {
    await this.throttlerService.atomicTokenBucketThrottleOrThrow({
      key: buildTwoFactorAuthenticationOtpRateLimitKey({ userId, workspaceId }),
      maxTokens: TWO_FACTOR_AUTHENTICATION_OTP_RATE_LIMIT_MAX,
      timeWindow: TWO_FACTOR_AUTHENTICATION_OTP_RATE_LIMIT_WINDOW_MS,
    });

    const userTwoFactorAuthenticationMethod =
      await this.twoFactorAuthenticationMethodRepository.findOne(workspaceId, {
        where: {
          strategy: twoFactorAuthenticationStrategy,
          userWorkspace: {
            userId,
            workspaceId,
          },
        },
      });

    if (!isDefined(userTwoFactorAuthenticationMethod)) {
      throw new TwoFactorAuthenticationException(
        'Two Factor Authentication Method not found.',
        TwoFactorAuthenticationExceptionCode.INVALID_CONFIGURATION,
      );
    }

    if (!isDefined(userTwoFactorAuthenticationMethod.secret)) {
      throw new TwoFactorAuthenticationException(
        'Malformed Two Factor Authentication Method object',
        TwoFactorAuthenticationExceptionCode.MALFORMED_DATABASE_OBJECT,
      );
    }

    const originalSecret = await this.decryptStoredSecret({
      storedSecret: userTwoFactorAuthenticationMethod.secret,
      workspaceId,
    });

    const otpContext = {
      status: userTwoFactorAuthenticationMethod.status,
      secret: originalSecret,
    };

    const validationResult = new TotpStrategy(
      TOTP_DEFAULT_CONFIGURATION,
    ).validate(token, otpContext);

    if (!validationResult.isValid) {
      throw new TwoFactorAuthenticationException(
        'Invalid OTP',
        TwoFactorAuthenticationExceptionCode.INVALID_OTP,
      );
    }

    await this.twoFactorAuthenticationMethodRepository.update(
      workspaceId,
      { id: userTwoFactorAuthenticationMethod.id },
      { status: OTPStatus.VERIFIED },
    );

    await this.revokePendingRecoveryCodes({
      workspaceId,
      userWorkspaceId: userTwoFactorAuthenticationMethod.userWorkspaceId,
    });
  }

  async revokePendingRecoveryCodes({
    workspaceId,
    userWorkspaceId,
  }: {
    workspaceId: WorkspaceEntity['id'];
    userWorkspaceId: string;
  }): Promise<number> {
    const updateResult =
      await this.twoFactorAuthenticationRecoveryCodeRepository.update(
        workspaceId,
        { userWorkspaceId, usedAt: IsNull(), revokedAt: IsNull() },
        { revokedAt: new Date() },
      );

    return updateResult.affected ?? 0;
  }

  async assertFreshStepUpAuthenticationOrThrow({
    userId,
    workspaceId,
    otp,
    otpRequiredMessage,
    twoFactorAuthenticationRequiredMessage,
  }: {
    userId: UserEntity['id'];
    workspaceId: WorkspaceEntity['id'];
    otp?: string;
    otpRequiredMessage: MessageDescriptor;
    twoFactorAuthenticationRequiredMessage: MessageDescriptor;
  }): Promise<void> {
    if (!isNonEmptyString(otp)) {
      throw new TwoFactorAuthenticationException(
        'A two-factor authentication code is required for this action',
        TwoFactorAuthenticationExceptionCode.STEP_UP_AUTHENTICATION_REQUIRED,
        { userFriendlyMessage: otpRequiredMessage },
      );
    }

    const hasVerifiedTwoFactorAuthenticationMethod =
      await this.twoFactorAuthenticationMethodRepository.exists(workspaceId, {
        where: { userWorkspace: { userId }, status: OTPStatus.VERIFIED },
      });

    if (!hasVerifiedTwoFactorAuthenticationMethod) {
      throw new TwoFactorAuthenticationException(
        'Two-factor authentication must be enabled in the current workspace for this action',
        TwoFactorAuthenticationExceptionCode.STEP_UP_AUTHENTICATION_REQUIRED,
        { userFriendlyMessage: twoFactorAuthenticationRequiredMessage },
      );
    }

    await this.verifyTwoFactorAuthenticationMethodForAuthenticatedUser(
      userId,
      otp,
      workspaceId,
    );
  }

  async verifyTwoFactorAuthenticationMethodForAuthenticatedUser(
    userId: UserEntity['id'],
    token: string,
    workspaceId: WorkspaceEntity['id'],
  ) {
    await this.validateStrategy(
      userId,
      token,
      workspaceId,
      TwoFactorAuthenticationStrategy.TOTP,
    );

    return { success: true };
  }
}
