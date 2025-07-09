import { UseFilters, UseGuards } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Args, Mutation, Resolver } from '@nestjs/graphql';

import { Repository } from 'typeorm';
import { isDefined } from 'twenty-shared/utils';

import { User } from 'src/engine/core-modules/user/user.entity';
import {
  AuthException,
  AuthExceptionCode,
} from 'src/engine/core-modules/auth/auth.exception';
import { PublicEndpointGuard } from 'src/engine/guards/public-endpoint.guard';
import { PermissionsGraphqlApiExceptionFilter } from 'src/engine/metadata-modules/permissions/utils/permissions-graphql-api-exception.filter';
import { CaptchaGuard } from 'src/engine/core-modules/captcha/captcha.guard';
import { LoginTokenService } from 'src/engine/core-modules/auth/token/services/login-token.service';
import { DomainManagerService } from 'src/engine/core-modules/domain-manager/services/domain-manager.service';
import { workspaceValidator } from 'src/engine/core-modules/workspace/workspace.validate';
import { AuthGraphqlApiExceptionFilter } from 'src/engine/core-modules/auth/filters/auth-graphql-api-exception.filter';

import { TwoFactorAuthenticationService } from './two-factor-authentication.service';

import { InitiateTwoFactorAuthenticationProvisioningInput } from './dto/initiate-two-factor-authentication-provisioning.input';
import { InitiateTwoFactorAuthenticationProvisioningOutput } from './dto/initiate-two-factor-authentication-provisioning.output';

@Resolver()
@UseFilters(AuthGraphqlApiExceptionFilter, PermissionsGraphqlApiExceptionFilter)
export class TwoFactorAuthenticationResolver {
  constructor(
    private readonly loginTokenService: LoginTokenService,
    private readonly domainManagerService: DomainManagerService,
    private readonly twoFactorAuthenticationService: TwoFactorAuthenticationService,
    @InjectRepository(User, 'core')
    private readonly userRepository: Repository<User>,
  ) {}

  @Mutation(() => InitiateTwoFactorAuthenticationProvisioningOutput)
  @UseGuards(CaptchaGuard, PublicEndpointGuard)
  async initiateOTPProvisioning(
    @Args()
    initiateTwoFactorAuthenticationProvisioningInput: InitiateTwoFactorAuthenticationProvisioningInput,
    @Args('origin') origin: string,
  ): Promise<InitiateTwoFactorAuthenticationProvisioningOutput> {
    const { userId, sub: userEmail } =
      await this.loginTokenService.verifyLoginToken(
        initiateTwoFactorAuthenticationProvisioningInput.loginToken,
      );

    const workspace =
      await this.domainManagerService.getWorkspaceByOriginOrDefaultWorkspace(
        origin,
      );

    workspaceValidator.assertIsDefinedOrThrow(
      workspace,
      new AuthException(
        'Workspace not found',
        AuthExceptionCode.WORKSPACE_NOT_FOUND,
      ),
    );

    const uri =
      await this.twoFactorAuthenticationService.initiateStrategyConfiguration(
        userId,
        userEmail,
        workspace.id,
      );

    if (!isDefined(uri)) {
      throw new AuthException(
        'OTP Auth URL missing ',
        AuthExceptionCode.INTERNAL_SERVER_ERROR,
      );
    }

    return { uri };
  }
}
