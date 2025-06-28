import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import * as speakeasy from 'speakeasy';
import { Repository } from 'typeorm';
import { TwoFactorAuthenticationProviders } from 'twenty-shared/workspace';

import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { User } from 'src/engine/core-modules/user/user.entity';
import {
  AuthException,
  AuthExceptionCode,
} from 'src/engine/core-modules/auth/auth.exception';
import { TwoFactorMethod } from 'src/engine/core-modules/two-factor-authentication/entities/two-factor-authentication-method.entity';
import { UserWorkspaceService } from 'src/engine/core-modules/user-workspace/user-workspace.service';

@Injectable()
// eslint-disable-next-line @nx/workspace-inject-workspace-repository
export class TwoFactorAuthenticationService {
  constructor(
    @InjectRepository(TwoFactorMethod, 'core')
    private readonly twoFactorAuthenticationMethodRepository: Repository<TwoFactorMethod>,
    private readonly twentyConfigService: TwentyConfigService,
    private readonly userWorkspaceService: UserWorkspaceService,
    @InjectRepository(User, 'core')
    private readonly userRepository: Repository<User>,
  ) {}

  async checkIf2FARequired(
    targetWorkspace: Workspace,
    userTwoFactorAuthenticationProviders: TwoFactorMethod[],
  ) {
    const isTwoFactorAuthenticationEnabled = this.twentyConfigService.get(
      'IS_TWO_FACTOR_AUTHENTICATION_ENABLED',
    );

    const isTwoFactorAuthenticationGloballyEnforced =
      this.twentyConfigService.get(
        'IS_TWO_FACTOR_AUTHENTICATION_GLOBALLY_ENFORCED',
      );

    const shouldEnforce2FA =
      isTwoFactorAuthenticationEnabled &&
      (isTwoFactorAuthenticationGloballyEnforced ||
        Boolean(targetWorkspace?.twoFactorAuthenticationPolicy));

    if (!shouldEnforce2FA) return;

    if (userTwoFactorAuthenticationProviders.length > 0) {
      throw new AuthException(
        'Two factor authentication verification required',
        AuthExceptionCode.TWO_FACTOR_AUTHENTICATION_VERIFICATION,
      );
    } else {
      throw new AuthException(
        'Two factor authentication setup required',
        AuthExceptionCode.TWO_FACTOR_AUTHENTICATION_PROVISION,
      );
    }
  }

  private generateSecret(email: string) {
    return speakeasy.generateSecret({
      name: `MyApp (${email})`,
      otpauth_url: true,
    });
  }

  async initiateTwoFactorProvisioning(userId: string, workspaceId: string) {
    const userWorkspace =
      await this.userWorkspaceService.getUserWorkspaceForUserOrThrow({
        userId,
        workspaceId,
      });

    const existing = await this.twoFactorAuthenticationMethodRepository.findOne(
      {
        where: {
          userWorkspace: { id: userWorkspace.id },
          strategy: TwoFactorAuthenticationProviders.TOTP,
        },
      },
    );

    if (existing && existing.context?.status !== 'PENDING') {
      throw new AuthException(
        'Two factor authentication has already been provisioned.',
        AuthExceptionCode.INTERNAL_SERVER_ERROR,
      );
    }

    const secret = this.generateSecret(userId);

    await this.twoFactorAuthenticationMethodRepository.save({
      ...(existing ? { id: existing.id } : {}),
      userWorkspace: userWorkspace,
      context: {
        secret: secret.hex,
        status: 'PENDING',
        timestep: '30',
      },
      strategy: TwoFactorAuthenticationProviders.TOTP,
    });

    return secret;
  }

  async verifyToken(
    userId: string,
    token: string,
    workspaceId: string,
  ): Promise<User> {
    const userTwoFactorAuthenticationMethod =
      await this.twoFactorAuthenticationMethodRepository.findOne({
        where: {
          userWorkspace: {
            userId,
            workspaceId,
          },
        },
        relations: {
          userWorkspace: {
            user: true,
          },
        },
      });

    if (
      !userTwoFactorAuthenticationMethod?.userWorkspace.user ||
      !userTwoFactorAuthenticationMethod.context
    ) {
      throw new AuthException(
        'Malformed Request',
        AuthExceptionCode.INVALID_DATA,
      );
    }

    const isValid = speakeasy.totp.verify({
      secret: userTwoFactorAuthenticationMethod?.context?.secret as string,
      encoding: 'hex',
      token,
      window: 1,
    });

    if (!isValid) {
      throw new AuthException(
        'Wrong OTP',
        AuthExceptionCode.FORBIDDEN_EXCEPTION,
      );
    }

    userTwoFactorAuthenticationMethod.context.status = 'VERIFIED';
    await this.twoFactorAuthenticationMethodRepository.save(
      userTwoFactorAuthenticationMethod,
    );

    return userTwoFactorAuthenticationMethod?.userWorkspace.user;
  }
}
