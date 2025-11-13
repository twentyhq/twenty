import { UseFilters, UseGuards } from '@nestjs/common';
import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { InjectRepository } from '@nestjs/typeorm';

import { assertIsDefinedOrThrow, isDefined } from 'twenty-shared/utils';
import { Repository } from 'typeorm';

import {
  AuthException,
  AuthExceptionCode,
} from 'src/engine/core-modules/auth/auth.exception';
import { AuthGraphqlApiExceptionFilter } from 'src/engine/core-modules/auth/filters/auth-graphql-api-exception.filter';
import { LoginTokenService } from 'src/engine/core-modules/auth/token/services/login-token.service';
import { WorkspaceDomainsService } from 'src/engine/core-modules/domain/workspace-domains/services/workspace-domains.service';
import { UserService } from 'src/engine/core-modules/user/services/user.service';
import { UserEntity } from 'src/engine/core-modules/user/user.entity';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthUser } from 'src/engine/decorators/auth/auth-user.decorator';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { CustomPermissionGuard } from 'src/engine/guards/custom-permission.guard';
import { NoPermissionGuard } from 'src/engine/guards/no-permission.guard';
import { PublicEndpointGuard } from 'src/engine/guards/public-endpoint.guard';
import { UserAuthGuard } from 'src/engine/guards/user-auth.guard';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';
import { PermissionsGraphqlApiExceptionFilter } from 'src/engine/metadata-modules/permissions/utils/permissions-graphql-api-exception.filter';

import { TwoFactorAuthenticationService } from './two-factor-authentication.service';

import { DeleteTwoFactorAuthenticationMethodInput } from './dto/delete-two-factor-authentication-method.input';
import { DeleteTwoFactorAuthenticationMethodOutput } from './dto/delete-two-factor-authentication-method.output';
import { InitiateTwoFactorAuthenticationProvisioningInput } from './dto/initiate-two-factor-authentication-provisioning.input';
import { InitiateTwoFactorAuthenticationProvisioningOutput } from './dto/initiate-two-factor-authentication-provisioning.output';
import { VerifyTwoFactorAuthenticationMethodInput } from './dto/verify-two-factor-authentication-method.input';
import { VerifyTwoFactorAuthenticationMethodOutput } from './dto/verify-two-factor-authentication-method.output';
import { TwoFactorAuthenticationMethodEntity } from './entities/two-factor-authentication-method.entity';

@Resolver()
@UseFilters(AuthGraphqlApiExceptionFilter, PermissionsGraphqlApiExceptionFilter)
export class TwoFactorAuthenticationResolver {
  constructor(
    private readonly twoFactorAuthenticationService: TwoFactorAuthenticationService,
    private readonly loginTokenService: LoginTokenService,
    private readonly userService: UserService,
    private readonly workspaceDomainsService: WorkspaceDomainsService,
    @InjectRepository(TwoFactorAuthenticationMethodEntity)
    private readonly twoFactorAuthenticationMethodRepository: Repository<TwoFactorAuthenticationMethodEntity>,
  ) {}

  @Mutation(() => InitiateTwoFactorAuthenticationProvisioningOutput)
  @UseGuards(PublicEndpointGuard, NoPermissionGuard)
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
      await this.workspaceDomainsService.getWorkspaceByOriginOrDefaultWorkspace(
        origin,
      );

    assertIsDefinedOrThrow(
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

    const user = await this.userService.findUserByEmailOrThrow(userEmail);

    const uri =
      await this.twoFactorAuthenticationService.initiateStrategyConfiguration(
        user.id,
        userEmail,
        workspace.id,
        workspace.displayName,
      );

    if (!isDefined(uri)) {
      throw new AuthException(
        'OTP Auth URL missing',
        AuthExceptionCode.INTERNAL_SERVER_ERROR,
      );
    }

    return { uri };
  }

  @Mutation(() => InitiateTwoFactorAuthenticationProvisioningOutput)
  @UseGuards(UserAuthGuard, NoPermissionGuard)
  async initiateOTPProvisioningForAuthenticatedUser(
    @AuthUser() user: UserEntity,
    @AuthWorkspace() workspace: WorkspaceEntity,
  ): Promise<InitiateTwoFactorAuthenticationProvisioningOutput> {
    const uri =
      await this.twoFactorAuthenticationService.initiateStrategyConfiguration(
        user.id,
        user.email,
        workspace.id,
        workspace.displayName,
      );

    if (!isDefined(uri)) {
      throw new AuthException(
        'OTP Auth URL missing',
        AuthExceptionCode.INTERNAL_SERVER_ERROR,
      );
    }

    return { uri };
  }

  @Mutation(() => DeleteTwoFactorAuthenticationMethodOutput)
  @UseGuards(WorkspaceAuthGuard, UserAuthGuard, CustomPermissionGuard)
  async deleteTwoFactorAuthenticationMethod(
    @Args()
    deleteTwoFactorAuthenticationMethodInput: DeleteTwoFactorAuthenticationMethodInput,
    @AuthWorkspace() workspace: WorkspaceEntity,
    @AuthUser() user: UserEntity,
  ): Promise<DeleteTwoFactorAuthenticationMethodOutput> {
    const twoFactorMethod =
      await this.twoFactorAuthenticationMethodRepository.findOne({
        where: {
          id: deleteTwoFactorAuthenticationMethodInput.twoFactorAuthenticationMethodId,
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
      deleteTwoFactorAuthenticationMethodInput.twoFactorAuthenticationMethodId,
    );

    return { success: true };
  }

  @Mutation(() => VerifyTwoFactorAuthenticationMethodOutput)
  @UseGuards(WorkspaceAuthGuard, UserAuthGuard, NoPermissionGuard)
  async verifyTwoFactorAuthenticationMethodForAuthenticatedUser(
    @Args()
    verifyTwoFactorAuthenticationMethodInput: VerifyTwoFactorAuthenticationMethodInput,
    @AuthWorkspace() workspace: WorkspaceEntity,
    @AuthUser() user: UserEntity,
  ): Promise<VerifyTwoFactorAuthenticationMethodOutput> {
    return await this.twoFactorAuthenticationService.verifyTwoFactorAuthenticationMethodForAuthenticatedUser(
      user.id,
      verifyTwoFactorAuthenticationMethodInput.otp,
      workspace.id,
    );
  }
}
