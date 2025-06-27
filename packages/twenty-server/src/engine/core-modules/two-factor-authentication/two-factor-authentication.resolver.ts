import * as speakeasy from 'speakeasy';
import { Injectable, UseFilters, UseGuards } from '@nestjs/common';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { User } from 'src/engine/core-modules/user/user.entity';
import {
  AuthException,
  AuthExceptionCode,
} from 'src/engine/core-modules/auth/auth.exception';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TwoFactorMethod } from 'src/engine/core-modules/two-factor-authentication/entities/two-factor-authentication-method.entity';
import { UserWorkspaceService } from '../user-workspace/user-workspace.service';
import { TwoFactorAuthenticationProviders } from 'twenty-shared/workspace';
import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { TwoFactorAuthenticationProvision } from './dto/two-factor-authentication-provisioning.output';
import { CaptchaGuard } from '../captcha/captcha.guard';
import { PublicEndpointGuard } from 'src/engine/guards/public-endpoint.guard';
import { InitiateTwoFactorAuthenticationProvisioningInput } from './dto/initiate-two-factor-authentication-provisioning.input';
import { LoginTokenService } from '../auth/token/services/login-token.service';
import { DomainManagerService } from '../domain-manager/services/domain-manager.service';
import { workspaceValidator } from '../workspace/workspace.validate';
import { TwoFactorAuthenticationService } from './services/two-factor-authentication.service';
import { AuthService } from '../auth/services/auth.service';
import { AuthGraphqlApiExceptionFilter } from '../auth/filters/auth-graphql-api-exception.filter';
import { PermissionsGraphqlApiExceptionFilter } from 'src/engine/metadata-modules/permissions/utils/permissions-graphql-api-exception.filter';
import { isDefined } from 'twenty-shared/utils';

@Resolver()
@UseFilters(AuthGraphqlApiExceptionFilter,PermissionsGraphqlApiExceptionFilter)
export class TwoFactorAuthenticationResolver { 
  constructor(
    private readonly loginTokenService: LoginTokenService,
    private readonly domainManagerService: DomainManagerService,
    private readonly twoFactorAuthenticationService: TwoFactorAuthenticationService,
    @InjectRepository(User, 'core')
    private readonly userRepository: Repository<User>,
  ) {}

  @Mutation(() => TwoFactorAuthenticationProvision)
  @UseGuards(CaptchaGuard, PublicEndpointGuard)
  async initiateTwoFactorAuthenticationProvisioning(
    @Args() initiateTwoFactorAuthenticationProvisioningInput: InitiateTwoFactorAuthenticationProvisioningInput,
    @Args('origin') origin: string,
  ): Promise<TwoFactorAuthenticationProvision> {
    const {
      sub: email,
      workspaceId,
      authProvider,
    } = await this.loginTokenService.verifyLoginToken(
      initiateTwoFactorAuthenticationProvisioningInput.loginToken,
    );

    const workspace =
      await this.domainManagerService.getWorkspaceByOriginOrDefaultWorkspace(
        origin
      );

    workspaceValidator.assertIsDefinedOrThrow(
      workspace,
      new AuthException(
        'Workspace not found',
        AuthExceptionCode.WORKSPACE_NOT_FOUND,
      ),
    );

    const user = await this.userRepository.findOneBy({ email })

    if (!isDefined(user)) {
      throw new AuthException(
        'User not found',
        AuthExceptionCode.USER_NOT_FOUND,
      );
    }

    const secret = await this.twoFactorAuthenticationService.initiateTwoFactorProvisioning(
      user.id,
      workspace.id
    ) 

    return { uri: secret.otpauth_url! };
  }
}
