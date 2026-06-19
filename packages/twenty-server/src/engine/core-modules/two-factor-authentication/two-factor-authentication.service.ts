import { Injectable } from '@nestjs/common';

import { authenticator } from 'otplib';
import { TwoFactorAuthenticationStrategy } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import {
  AuthException,
  AuthExceptionCode,
} from 'src/engine/core-modules/auth/auth.exception';
import { type EncryptedString } from 'src/engine/core-modules/secret-encryption/branded-strings/encrypted-string.type';
import { type PlaintextString } from 'src/engine/core-modules/secret-encryption/branded-strings/plaintext-string.type';
import { SecretEncryptionService } from 'src/engine/core-modules/secret-encryption/secret-encryption.service';
import { UserEntity } from 'src/engine/core-modules/user/user.entity';
import { TwoFactorAuthenticationMethodEntity } from 'src/engine/core-modules/two-factor-authentication/entities/two-factor-authentication-method.entity';
import { TOTP_DEFAULT_CONFIGURATION } from 'src/engine/core-modules/two-factor-authentication/strategies/otp/totp/constants/totp.strategy.constants';
import { TotpStrategy } from 'src/engine/core-modules/two-factor-authentication/strategies/otp/totp/totp.strategy';
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
    private readonly userWorkspaceService: UserWorkspaceService,
    private readonly secretEncryptionService: SecretEncryptionService,
  ) {}

  private decryptStoredSecret({
    storedSecret,
    workspaceId,
  }: {
    storedSecret: EncryptedString;
    workspaceId: string;
  }): PlaintextString {
    return this.secretEncryptionService.decryptVersionedOrThrow(storedSecret, {
      workspaceId,
    });
  }

  /**
   * Validates two-factor authentication requirements for a workspace.
   *
   * @throws {AuthException} with TWO_FACTOR_AUTHENTICATION_VERIFICATION_REQUIRED if 2FA is set up and needs verification
   * @throws {AuthException} with TWO_FACTOR_AUTHENTICATION_PROVISION_REQUIRED if 2FA is enforced but not set up
   * @param targetWorkspace - The workspace to check 2FA requirements for
   * @param userTwoFactorAuthenticationMethods - Optional array of user's 2FA methods
   */
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
      const existingSecret = this.decryptStoredSecret({
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

    await this.twoFactorAuthenticationMethodRepository.save(workspaceId, {
      id: existing2FAMethod?.id,
      userWorkspace: userWorkspace,
      secret: encryptedSecret,
      status: context.status,
      strategy: TwoFactorAuthenticationStrategy.TOTP,
    });

    return uri;
  }

  async validateStrategy(
    userId: UserEntity['id'],
    token: string,
    workspaceId: WorkspaceEntity['id'],
    twoFactorAuthenticationStrategy: TwoFactorAuthenticationStrategy,
  ) {
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

    const originalSecret = this.decryptStoredSecret({
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

    await this.twoFactorAuthenticationMethodRepository.save(workspaceId, {
      ...userTwoFactorAuthenticationMethod,
      status: OTPStatus.VERIFIED,
    });
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
