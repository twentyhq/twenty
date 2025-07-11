import { UseFilters, UseGuards } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Args, Mutation, Resolver } from '@nestjs/graphql';

import { Repository } from 'typeorm';
import { isDefined } from 'twenty-shared/utils';

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
import { UserAuthGuard } from 'src/engine/guards/user-auth.guard';
import { UserService } from 'src/engine/core-modules/user/services/user.service';

import { TwoFactorAuthenticationService } from './two-factor-authentication.service';

import { InitiateTwoFactorAuthenticationProvisioningInput } from './dto/initiate-two-factor-authentication-provisioning.input';
import { InitiateTwoFactorAuthenticationProvisioningOutput } from './dto/initiate-two-factor-authentication-provisioning.output';
import { ResetTwoFactorAuthenticationMethodInput } from './dto/reset-two-factor-authentication-method.input';
import { TwoFactorAuthenticationMethod } from './entities/two-factor-authentication-method.entity';
import { ResetTwoFactorAuthenticationMethodOutput } from './dto/reset-two-factor-authentication-method.output';

@Resolver()
@UseFilters(AuthGraphqlApiExceptionFilter, PermissionsGraphqlApiExceptionFilter)
export class TwoFactorAuthenticationResolver {
  constructor(
    private readonly loginTokenService: LoginTokenService,
    private readonly domainManagerService: DomainManagerService,
    private readonly twoFactorAuthenticationService: TwoFactorAuthenticationService,
    private readonly userService: UserService,
    @InjectRepository(TwoFactorAuthenticationMethod, 'core')
    private readonly twoFactorAuthenticationMethodRepository: Repository<TwoFactorAuthenticationMethod>,
  ) {}

  @Mutation(() => InitiateTwoFactorAuthenticationProvisioningOutput)
  @UseGuards(CaptchaGuard, PublicEndpointGuard)
  async initiateOTPProvisioning(
    @Args()
    initiateTwoFactorAuthenticationProvisioningInput: InitiateTwoFactorAuthenticationProvisioningInput,
    @Args('origin') origin: string,
  ): Promise<InitiateTwoFactorAuthenticationProvisioningOutput> {
    const { sub: userEmail } = await this.loginTokenService.verifyLoginToken(
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

    const user = await this.userService.getUserByEmail(userEmail);

    const uri =
      await this.twoFactorAuthenticationService.initiateStrategyConfiguration(
        user.id,
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

  @Mutation(() => ResetTwoFactorAuthenticationMethodOutput)
  @UseGuards(UserAuthGuard)
  async resetTwoFactorAuthenticationMethod(
    @Args()
    resetTwoFactorAuthenticationMethodInput: ResetTwoFactorAuthenticationMethodInput,
    @Args('origin') origin: string,
  ): Promise<ResetTwoFactorAuthenticationMethodOutput> {
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

    await this.twoFactorAuthenticationMethodRepository.delete({
      id: resetTwoFactorAuthenticationMethodInput.twoFactorAuthenticationMethodId,
    });

    return {
      success: true,
    };
  }
}
