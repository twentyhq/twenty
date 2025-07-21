import { UseFilters, UseGuards } from '@nestjs/common';
import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { InjectRepository } from '@nestjs/typeorm';

import { TwoFactorAuthenticationStrategy } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { Repository } from 'typeorm';

import {
  AuthException,
  AuthExceptionCode,
} from 'src/engine/core-modules/auth/auth.exception';
import { AuthGraphqlApiExceptionFilter } from 'src/engine/core-modules/auth/filters/auth-graphql-api-exception.filter';
import { LoginTokenService } from 'src/engine/core-modules/auth/token/services/login-token.service';
import { DomainManagerService } from 'src/engine/core-modules/domain-manager/services/domain-manager.service';
import { UserService } from 'src/engine/core-modules/user/services/user.service';
import { User } from 'src/engine/core-modules/user/user.entity';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { workspaceValidator } from 'src/engine/core-modules/workspace/workspace.validate';
import { AuthUser } from 'src/engine/decorators/auth/auth-user.decorator';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { PublicEndpointGuard } from 'src/engine/guards/public-endpoint.guard';
import { UserAuthGuard } from 'src/engine/guards/user-auth.guard';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';
import { PermissionsGraphqlApiExceptionFilter } from 'src/engine/metadata-modules/permissions/utils/permissions-graphql-api-exception.filter';

import { TwoFactorAuthenticationService } from './two-factor-authentication.service';

import { InitiateTwoFactorAuthenticationProvisioningInput } from './dto/initiate-two-factor-authentication-provisioning.input';
import { InitiateTwoFactorAuthenticationProvisioningOutput } from './dto/initiate-two-factor-authentication-provisioning.output';
import { ResetTwoFactorAuthenticationMethodInput } from './dto/reset-two-factor-authentication-method.input';
import { ResetTwoFactorAuthenticationMethodOutput } from './dto/reset-two-factor-authentication-method.output';
import { TwoFactorAuthenticationMethod } from './entities/two-factor-authentication-method.entity';

@Resolver()
@UseFilters(AuthGraphqlApiExceptionFilter, PermissionsGraphqlApiExceptionFilter)
export class TwoFactorAuthenticationResolver {
  constructor(
    private readonly twoFactorAuthenticationService: TwoFactorAuthenticationService,
    private readonly loginTokenService: LoginTokenService,
    private readonly userService: UserService,
    private readonly domainManagerService: DomainManagerService,
    @InjectRepository(TwoFactorAuthenticationMethod, 'core')
    private readonly twoFactorAuthenticationMethodRepository: Repository<TwoFactorAuthenticationMethod>,
  ) {}

  @Mutation(() => InitiateTwoFactorAuthenticationProvisioningOutput)
  @UseGuards(PublicEndpointGuard)
  async initiateOTPProvisioning(
    @Args()
    initiateTwoFactorAuthenticationProvisioningInput: InitiateTwoFactorAuthenticationProvisioningInput,
    @Args('origin') origin: string,
  ): Promise<InitiateTwoFactorAuthenticationProvisioningOutput> {
    const { sub: userEmail, workspaceId: tokenWorkspaceId } =
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

    if (tokenWorkspaceId !== workspace.id) {
      throw new AuthException(
        'Token is not valid for this workspace',
        AuthExceptionCode.FORBIDDEN_EXCEPTION,
      );
    }

    const user = await this.userService.getUserByEmail(userEmail);

    const uri =
      await this.twoFactorAuthenticationService.initiateStrategyConfiguration(
        user.id,
        userEmail,
        workspace.id,
        TwoFactorAuthenticationStrategy.TOTP,
      );

    if (!isDefined(uri)) {
      throw new AuthException(
        'OTP Auth URL missing ',
        AuthExceptionCode.INTERNAL_SERVER_ERROR,
      );
    }

    return { uri };
  }

  @Mutation(() => InitiateTwoFactorAuthenticationProvisioningOutput)
  @UseGuards(UserAuthGuard)
  async initiateOTPProvisioningForAuthenticatedUser(
    @AuthUser() user: User,
    @AuthWorkspace() workspace: Workspace,
  ): Promise<InitiateTwoFactorAuthenticationProvisioningOutput> {
    const uri =
      await this.twoFactorAuthenticationService.initiateStrategyConfiguration(
        user.id,
        user.email,
        workspace.id,
        TwoFactorAuthenticationStrategy.TOTP,
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
  @UseGuards(WorkspaceAuthGuard, UserAuthGuard)
  async resetTwoFactorAuthenticationMethod(
    @Args()
    resetTwoFactorAuthenticationMethodInput: ResetTwoFactorAuthenticationMethodInput,
    @AuthWorkspace() workspace: Workspace,
    @AuthUser() user: User,
  ): Promise<ResetTwoFactorAuthenticationMethodOutput> {
    // First, find the 2FA method to ensure it exists and belongs to the current user
    const twoFactorMethod =
      await this.twoFactorAuthenticationMethodRepository.findOne({
        where: {
          id: resetTwoFactorAuthenticationMethodInput.twoFactorAuthenticationMethodId,
        },
        relations: ['userWorkspace'],
      });

    if (!twoFactorMethod) {
      throw new AuthException(
        'Two-factor authentication method not found',
        AuthExceptionCode.INVALID_INPUT,
      );
    }

    if (
      twoFactorMethod.userWorkspace.userId !== user.id ||
      twoFactorMethod.userWorkspace.workspaceId !== workspace.id
    ) {
      throw new AuthException(
        'You can only delete your own two-factor authentication methods',
        AuthExceptionCode.FORBIDDEN_EXCEPTION,
      );
    }

    await this.twoFactorAuthenticationMethodRepository.delete(
      resetTwoFactorAuthenticationMethodInput.twoFactorAuthenticationMethodId,
    );

    return { success: true };
  }
}
