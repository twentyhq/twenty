import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { TwoFactorAuthenticationStrategy } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { Repository } from 'typeorm';

import {
    AuthException,
    AuthExceptionCode,
} from 'src/engine/core-modules/auth/auth.exception';
import { KeyWrappingService } from 'src/engine/core-modules/encryption/keys/wrapping/key-wrapping.service';
import { TwoFactorAuthenticationMethod } from 'src/engine/core-modules/two-factor-authentication/entities/two-factor-authentication-method.entity';
import { UserWorkspaceService } from 'src/engine/core-modules/user-workspace/user-workspace.service';
import { User } from 'src/engine/core-modules/user/user.entity';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';

import {
    TwoFactorAuthenticationException,
    TwoFactorAuthenticationExceptionCode,
} from './two-factor-authentication.exception';
import { twoFactorAuthenticationMethodsValidator } from './two-factor-authentication.validation';

import { OTPAuthenticationStrategyInterface } from './strategies/otp/interfaces/otp.strategy.interface';
import { OTPStatus } from './strategies/otp/otp.constants';
import { TOTP_DEFAULT_CONFIGURATION } from './strategies/otp/totp/constants/totp.strategy.constants';
import { TotpStrategy } from './strategies/otp/totp/totp.strategy';

@Injectable()
// eslint-disable-next-line @nx/workspace-inject-workspace-repository
export class TwoFactorAuthenticationService {
  constructor(
    @InjectRepository(TwoFactorAuthenticationMethod, 'core')
    private readonly twoFactorAuthenticationMethodRepository: Repository<TwoFactorAuthenticationMethod>,
    private readonly userWorkspaceService: UserWorkspaceService,
    private readonly keyWrappingService: KeyWrappingService,
  ) {}

  async is2FARequired(
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
    twoFactorAuthenticationStrategy: TwoFactorAuthenticationStrategy = TwoFactorAuthenticationStrategy.TOTP,
  ) {
    const userWorkspace =
      await this.userWorkspaceService.getUserWorkspaceForUserOrThrow({
        userId,
        workspaceId,
      });

    const twoFactorAuthenticatonStrategyInstance = this.getOTPStrategy(
      twoFactorAuthenticationStrategy,
    );

    const existing2FAMethod =
      await this.twoFactorAuthenticationMethodRepository.findOne({
        where: {
          userWorkspace: { id: userWorkspace.id },
          strategy: twoFactorAuthenticatonStrategyInstance.name,
        },
      });

    if (existing2FAMethod && existing2FAMethod.context?.status !== 'PENDING') {
      throw new TwoFactorAuthenticationException(
        'Two factor authentication has already been provisioned. Please delete and try again.',
        TwoFactorAuthenticationExceptionCode.TWO_FACTOR_AUTHENTICATION_METHOD_ALREADY_PROVISIONED,
      );
    }

    const { uri, context } = twoFactorAuthenticatonStrategyInstance.initiate(
      userEmail,
      userWorkspace.workspace.displayName || '',
    );

    const { wrappedKey } = await this.keyWrappingService.wrapKey(
      Buffer.from(context.secret),
      userId + workspaceId + 'otp-secret',
    );

    await this.twoFactorAuthenticationMethodRepository.save({
      id: existing2FAMethod?.id,
      userWorkspace: userWorkspace,
      context: {
        ...context,
        secret: wrappedKey,
      },
      strategy: twoFactorAuthenticatonStrategyInstance.name,
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

    if (!isDefined(userTwoFactorAuthenticationMethod.context)) {
      throw new TwoFactorAuthenticationException(
        'Malformed Two Factor Authentication Method object',
        TwoFactorAuthenticationExceptionCode.MALFORMED_DATABASE_OBJECT,
      );
    }

    const { unwrappedKey } = await this.keyWrappingService.unwrapKey(
      Buffer.from(userTwoFactorAuthenticationMethod.context.secret, 'hex'),
      userId + workspaceId + 'otp-secret',
    );

    const otpContext = {
      ...userTwoFactorAuthenticationMethod?.context,
      secret: unwrappedKey,
    };

    const twoFactorAuthenticationStrategyInstance = this.getOTPStrategy(
      twoFactorAuthenticationStrategy,
    );

    const isValid = twoFactorAuthenticationStrategyInstance.validate(
      token,
      otpContext,
    );

    if (!isValid) {
      throw new TwoFactorAuthenticationException(
        'Invalid OTP',
        TwoFactorAuthenticationExceptionCode.INVALID_OTP,
      );
    }

    await this.twoFactorAuthenticationMethodRepository.save({
      ...userTwoFactorAuthenticationMethod,
      context: {
        ...userTwoFactorAuthenticationMethod.context,
        status: OTPStatus.VERIFIED,
      },
    });
  }

  getOTPStrategy(
    otpStrategy: TwoFactorAuthenticationStrategy,
  ): OTPAuthenticationStrategyInterface {
    switch (otpStrategy) {
      case TwoFactorAuthenticationStrategy.TOTP:
        return new TotpStrategy(TOTP_DEFAULT_CONFIGURATION);
      default:
        throw new TwoFactorAuthenticationException(
          'Unsupported strategy.',
          TwoFactorAuthenticationExceptionCode.INVALID_CONFIGURATION,
        );
    }
  }
}
