import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { User } from 'src/engine/core-modules/user/user.entity';
import { TwoFactorAuthenticationMethod } from 'src/engine/core-modules/two-factor-authentication/entities/two-factor-authentication-method.entity';
import { UserWorkspaceService } from 'src/engine/core-modules/user-workspace/user-workspace.service';
import { TWO_FACTOR_AUTHENTICATION_STRATEGY } from './two-factor-authentication.constants';
import { ITwoFactorAuthStrategy } from './interfaces/two-factor-authentication.interface';
import { TwoFactorAuthenticationException, TwoFactorAuthenticationExceptionCode } from './two-factor-authentication.exception';

@Injectable()
// eslint-disable-next-line @nx/workspace-inject-workspace-repository
export class TwoFactorAuthenticationService {
  constructor(
    @InjectRepository(TwoFactorAuthenticationMethod, 'core')
    private readonly twoFactorAuthenticationMethodRepository: Repository<TwoFactorAuthenticationMethod>,
    private readonly twentyConfigService: TwentyConfigService,
    private readonly userWorkspaceService: UserWorkspaceService,
    @Inject(TWO_FACTOR_AUTHENTICATION_STRATEGY) 
    private twoFactorAuthenticationStrategy: ITwoFactorAuthStrategy
  ) {}

  async is2FARequired(
    targetWorkspace: Workspace,
    userTwoFactorAuthenticationProviders: TwoFactorAuthenticationMethod[],
  ) {
    const isTwoFactorAuthenticationEnabled = this.twentyConfigService.get(
      'IS_TWO_FACTOR_AUTHENTICATION_ENABLED',
    );

    const shouldEnforce2FA =
      isTwoFactorAuthenticationEnabled &&
        Boolean(targetWorkspace?.twoFactorAuthenticationPolicy);

    if (!shouldEnforce2FA) return;

    if (userTwoFactorAuthenticationProviders.length > 0) {
      throw new TwoFactorAuthenticationException(
        'Two factor authentication verification required',
        TwoFactorAuthenticationExceptionCode.TWO_FACTOR_AUTHENTICATION_VERIFICATION_REQUIRED,
      );
    } else {
      throw new TwoFactorAuthenticationException(
        'Two factor authentication setup required',
        TwoFactorAuthenticationExceptionCode.TWO_FACTOR_AUTHENTICATION_PROVISION_REQUIRED,
      );
    }
  }

  async initiateStrategyConfiguration(
    userId: string, 
    userEmail: string,
    workspaceId: string
  ) {
    const userWorkspace =
      await this.userWorkspaceService.getUserWorkspaceForUserOrThrow({
        userId,
        workspaceId,
      });

    const existing2FAMethod = await this.twoFactorAuthenticationMethodRepository.findOne(
      {
        where: {
          userWorkspace: { id: userWorkspace.id },
          strategy: this.twoFactorAuthenticationStrategy.name
        },
      },
    );

    if (existing2FAMethod && existing2FAMethod.context?.status !== 'PENDING') {
      throw new TwoFactorAuthenticationException(
        'Two factor authentication has already been provisioned. Please delete and try again.',
        TwoFactorAuthenticationExceptionCode.TWO_FACTOR_AUTHENTICATION_METHOD_ALREADY_PROVISIONED,
      );
    }

    const {
      uri,
      context
    } = this.twoFactorAuthenticationStrategy.initiate(
      userEmail,
      userWorkspace.workspace.displayName || '',
      0
    );

    await this.twoFactorAuthenticationMethodRepository.save({
      id: existing2FAMethod?.id,
      userWorkspace: userWorkspace,
      context,
      strategy: this.twoFactorAuthenticationStrategy.name,
    });

    return uri
  }

  async validateStrategy(
    userId: string,
    token: string,
    workspaceId: string,
  ): Promise<User> {
    const userTwoFactorAuthenticationMethod =
      await this.twoFactorAuthenticationMethodRepository.findOne({
        where: {
          strategy: this.twoFactorAuthenticationStrategy.name,
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
      throw new TwoFactorAuthenticationException(
        'Malformed Database Object',
        TwoFactorAuthenticationExceptionCode.MALFORMED_DATABASE_OBJECT,
      );
    }

    const isValid = this.twoFactorAuthenticationStrategy.validate(
      token,
      userTwoFactorAuthenticationMethod?.context,
    );

    if (!isValid) {
      throw new TwoFactorAuthenticationException(
        'Invalid OTP',
        TwoFactorAuthenticationExceptionCode.INVALID_OTP,
      );
    }

    userTwoFactorAuthenticationMethod.context.status = 'VERIFIED';
    await this.twoFactorAuthenticationMethodRepository.save(
      userTwoFactorAuthenticationMethod,
    );

    return userTwoFactorAuthenticationMethod?.userWorkspace.user;
  }
}