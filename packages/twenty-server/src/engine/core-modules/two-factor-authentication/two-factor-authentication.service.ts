import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { TwoFactorAuthenticationStrategy } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { Repository } from 'typeorm';

import {
  AuthException,
  AuthExceptionCode,
} from 'src/engine/core-modules/auth/auth.exception';
import { TwoFactorAuthenticationMethod } from 'src/engine/core-modules/two-factor-authentication/entities/two-factor-authentication-method.entity';
import { TOTP_DEFAULT_CONFIGURATION } from 'src/engine/core-modules/two-factor-authentication/strategies/otp/totp/constants/totp.strategy.constants';
import { TotpStrategy } from 'src/engine/core-modules/two-factor-authentication/strategies/otp/totp/totp.strategy';
import { SimpleSecretEncryptionUtil } from 'src/engine/core-modules/two-factor-authentication/utils/simple-secret-encryption.util';
import { UserWorkspaceService } from 'src/engine/core-modules/user-workspace/user-workspace.service';
import { User } from 'src/engine/core-modules/user/user.entity';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';

import {
  TwoFactorAuthenticationException,
  TwoFactorAuthenticationExceptionCode,
} from './two-factor-authentication.exception';
import { twoFactorAuthenticationMethodsValidator } from './two-factor-authentication.validation';

import { OTPStatus } from './strategies/otp/otp.constants';

@Injectable()
// eslint-disable-next-line @nx/workspace-inject-workspace-repository
export class TwoFactorAuthenticationService {
  constructor(
    @InjectRepository(TwoFactorAuthenticationMethod, 'core')
    private readonly twoFactorAuthenticationMethodRepository: Repository<TwoFactorAuthenticationMethod>,
    private readonly userWorkspaceService: UserWorkspaceService,
    private readonly simpleSecretEncryptionUtil: SimpleSecretEncryptionUtil,
  ) {}

  /**
   * Validates two-factor authentication requirements for a workspace.
   *
   * @throws {AuthException} with TWO_FACTOR_AUTHENTICATION_VERIFICATION_REQUIRED if 2FA is set up and needs verification
   * @throws {AuthException} with TWO_FACTOR_AUTHENTICATION_PROVISION_REQUIRED if 2FA is enforced but not set up
   * @param targetWorkspace - The workspace to check 2FA requirements for
   * @param userTwoFactorAuthenticationMethods - Optional array of user's 2FA methods
   */
  async validateTwoFactorAuthenticationRequirement(
    targetWorkspace: Workspace,
    userTwoFactorAuthenticationMethods?: TwoFactorAuthenticationMethod[],
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
  ) {
    const userWorkspace =
      await this.userWorkspaceService.getUserWorkspaceForUserOrThrow({
        userId,
        workspaceId,
      });

    const existing2FAMethod =
      await this.twoFactorAuthenticationMethodRepository.findOne({
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

    const { uri, context } = new TotpStrategy(
      TOTP_DEFAULT_CONFIGURATION,
    ).initiate(
      userEmail,
      `Twenty${userWorkspace.workspace.displayName ? ` - ${userWorkspace.workspace.displayName}` : ''}`,
    );

    const encryptedSecret = await this.simpleSecretEncryptionUtil.encryptSecret(
      context.secret,
      userId + workspaceId + 'otp-secret',
    );

    await this.twoFactorAuthenticationMethodRepository.save({
      id: existing2FAMethod?.id,
      userWorkspace: userWorkspace,
      secret: encryptedSecret,
      status: context.status,
      strategy: TwoFactorAuthenticationStrategy.TOTP,
    });

    return uri;
  }

  async validateStrategy(
    userId: User['id'],
    token: string,
    workspaceId: Workspace['id'],
    twoFactorAuthenticationStrategy: TwoFactorAuthenticationStrategy,
  ) {
    const userTwoFactorAuthenticationMethod =
      await this.twoFactorAuthenticationMethodRepository.findOne({
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

    const originalSecret = await this.simpleSecretEncryptionUtil.decryptSecret(
      userTwoFactorAuthenticationMethod.secret,
      userId + workspaceId + 'otp-secret',
    );

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

    await this.twoFactorAuthenticationMethodRepository.save({
      ...userTwoFactorAuthenticationMethod,
      status: OTPStatus.VERIFIED,
    });
  }

  async verifyTwoFactorAuthenticationMethodForAuthenticatedUser(
    userId: User['id'],
    token: string,
    workspaceId: Workspace['id'],
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
