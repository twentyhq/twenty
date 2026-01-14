import { BadRequestException, UseFilters, UseGuards } from '@nestjs/common';
import {
  Args,
  Mutation,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';
import { InjectRepository } from '@nestjs/typeorm';

import crypto from 'crypto';

import { msg } from '@lingui/core/macro';
import { GraphQLJSONObject } from 'graphql-type-json';
import { PermissionFlagType } from 'twenty-shared/constants';
import { isDefined } from 'twenty-shared/utils';
import { WorkspaceActivationStatus } from 'twenty-shared/workspace';
import { In, Repository } from 'typeorm';

import { SupportDriver } from 'src/engine/core-modules/twenty-config/interfaces/support.interface';

import { ApiKeyEntity } from 'src/engine/core-modules/api-key/api-key.entity';
import {
  AuthException,
  AuthExceptionCode,
} from 'src/engine/core-modules/auth/auth.exception';
import { AvailableWorkspaces } from 'src/engine/core-modules/auth/dto/available-workspaces.output';
import { OnboardingStatus } from 'src/engine/core-modules/onboarding/enums/onboarding-status.enum';
import {
  OnboardingService,
  OnboardingStepKeys,
} from 'src/engine/core-modules/onboarding/onboarding.service';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { buildTwoFactorAuthenticationMethodSummary } from 'src/engine/core-modules/two-factor-authentication/utils/two-factor-authentication-method.presenter';
import { UserWorkspaceEntity } from 'src/engine/core-modules/user-workspace/user-workspace.entity';
import { UserWorkspaceService } from 'src/engine/core-modules/user-workspace/user-workspace.service';
import { DeletedWorkspaceMemberDTO } from 'src/engine/core-modules/user/dtos/deleted-workspace-member.dto';
import { UpdateUserEmailInput } from 'src/engine/core-modules/user/dtos/update-user-email.input';
import { WorkspaceMemberDTO } from 'src/engine/core-modules/user/dtos/workspace-member.dto';
import { UserService } from 'src/engine/core-modules/user/services/user.service';
import {
  type ToWorkspaceMemberDtoArgs,
  WorkspaceMemberTranspiler,
} from 'src/engine/core-modules/user/services/workspace-member-transpiler.service';
import { UserVarsService } from 'src/engine/core-modules/user/user-vars/services/user-vars.service';
import { UserEntity } from 'src/engine/core-modules/user/user.entity';
import { userValidator } from 'src/engine/core-modules/user/user.validate';
import { AuthProviderEnum } from 'src/engine/core-modules/workspace/types/workspace.type';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthApiKey } from 'src/engine/decorators/auth/auth-api-key.decorator';
import { AuthProvider } from 'src/engine/decorators/auth/auth-provider.decorator';
import { AuthUserWorkspaceId } from 'src/engine/decorators/auth/auth-user-workspace-id.decorator';
import { AuthUser } from 'src/engine/decorators/auth/auth-user.decorator';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { CustomPermissionGuard } from 'src/engine/guards/custom-permission.guard';
import { NoPermissionGuard } from 'src/engine/guards/no-permission.guard';
import { SettingsPermissionGuard } from 'src/engine/guards/settings-permission.guard';
import { UserAuthGuard } from 'src/engine/guards/user-auth.guard';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';
import {
  PermissionsException,
  PermissionsExceptionCode,
  PermissionsExceptionMessage,
} from 'src/engine/metadata-modules/permissions/permissions.exception';
import { PermissionsService } from 'src/engine/metadata-modules/permissions/permissions.service';
import { type UserWorkspacePermissions } from 'src/engine/metadata-modules/permissions/types/user-workspace-permissions';
import { PermissionsGraphqlApiExceptionFilter } from 'src/engine/metadata-modules/permissions/utils/permissions-graphql-api-exception.filter';
import { fromUserWorkspacePermissionsToUserWorkspacePermissionsDto } from 'src/engine/metadata-modules/role/utils/fromUserWorkspacePermissionsToUserWorkspacePermissionsDto';
import { UserRoleService } from 'src/engine/metadata-modules/user-role/user-role.service';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { AccountsToReconnectKeys } from 'src/modules/connected-account/types/accounts-to-reconnect-key-value.type';
import { WorkspaceMemberWorkspaceEntity } from 'src/modules/workspace-member/standard-objects/workspace-member.workspace-entity';

const getHMACKey = (email?: string, key?: string | null) => {
  if (!email || !key) return null;

  const hmac = crypto.createHmac('sha256', key);

  return hmac.update(email).digest('hex');
};

@Resolver(() => UserEntity)
@UseFilters(PermissionsGraphqlApiExceptionFilter)
export class UserResolver {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    private readonly userService: UserService,
    private readonly twentyConfigService: TwentyConfigService,
    private readonly onboardingService: OnboardingService,
    private readonly userVarService: UserVarsService,
    @InjectRepository(UserWorkspaceEntity)
    private readonly userWorkspaceRepository: Repository<UserWorkspaceEntity>,
    private readonly userRoleService: UserRoleService,
    private readonly permissionsService: PermissionsService,
    private readonly workspaceMemberTranspiler: WorkspaceMemberTranspiler,
    private readonly userWorkspaceService: UserWorkspaceService,
    private readonly globalWorkspaceOrmManager: GlobalWorkspaceOrmManager,
  ) {}

  private async getUserWorkspacePermissions({
    currentUserWorkspace,
    workspace,
  }: {
    workspace: WorkspaceEntity;
    currentUserWorkspace: UserWorkspaceEntity;
  }): Promise<UserWorkspacePermissions> {
    const workspaceIsPendingOrOngoingCreation = [
      WorkspaceActivationStatus.PENDING_CREATION,
      WorkspaceActivationStatus.ONGOING_CREATION,
    ].includes(workspace.activationStatus);

    if (workspaceIsPendingOrOngoingCreation) {
      return this.permissionsService.getDefaultUserWorkspacePermissions();
    }

    return await this.permissionsService.getUserWorkspacePermissions({
      userWorkspaceId: currentUserWorkspace.id,
      workspaceId: workspace.id,
    });
  }

  @Query(() => UserEntity)
  @UseGuards(UserAuthGuard, NoPermissionGuard)
  async currentUser(
    @AuthUser() { id: userId }: UserEntity,
    @AuthWorkspace({ allowUndefined: true }) workspace: WorkspaceEntity,
  ): Promise<UserEntity> {
    const user = await this.userRepository.findOne({
      where: {
        id: userId,
      },
      relations: {
        userWorkspaces: {
          twoFactorAuthenticationMethods: true,
        },
      },
    });

    userValidator.assertIsDefinedOrThrow(
      user,
      new AuthException(
        'UserEntity not found',
        AuthExceptionCode.USER_NOT_FOUND,
      ),
    );

    if (!workspace) {
      return user;
    }

    const currentUserWorkspace = user.userWorkspaces.find(
      (userWorkspace) => userWorkspace.workspaceId === workspace.id,
    );

    if (!isDefined(currentUserWorkspace)) {
      throw new Error('Current user workspace not found');
    }

    const userWorkspacePermissions =
      fromUserWorkspacePermissionsToUserWorkspacePermissionsDto(
        await this.getUserWorkspacePermissions({
          currentUserWorkspace,
          workspace,
        }),
      );

    const twoFactorAuthenticationMethodSummary =
      buildTwoFactorAuthenticationMethodSummary(
        currentUserWorkspace.twoFactorAuthenticationMethods,
      );

    return {
      ...user,
      currentUserWorkspace: {
        ...currentUserWorkspace,
        ...userWorkspacePermissions,
        twoFactorAuthenticationMethodSummary,
      },
      currentWorkspace: workspace,
    };
  }

  @ResolveField(() => GraphQLJSONObject, {
    nullable: true,
  })
  async userVars(
    @Parent() user: UserEntity,
    @AuthWorkspace({ allowUndefined: true })
    workspace: WorkspaceEntity | undefined,
  ): Promise<Record<string, unknown>> {
    if (!workspace) return {};
    const userVars = await this.userVarService.getAll({
      userId: user.id,
      workspaceId: workspace.id,
    });

    const userVarAllowList: string[] = [
      OnboardingStepKeys.ONBOARDING_CONNECT_ACCOUNT_PENDING,
      AccountsToReconnectKeys.ACCOUNTS_TO_RECONNECT_INSUFFICIENT_PERMISSIONS,
      AccountsToReconnectKeys.ACCOUNTS_TO_RECONNECT_EMAIL_ALIASES,
    ];

    const filteredMap = new Map(
      [...userVars].filter(([key]) => userVarAllowList.includes(key)),
    );

    return Object.fromEntries(filteredMap);
  }

  @ResolveField(() => WorkspaceMemberDTO, {
    nullable: true,
  })
  async workspaceMember(
    @Parent() user: UserEntity,
    @AuthWorkspace({ allowUndefined: true })
    workspace: WorkspaceEntity | undefined,
  ): Promise<WorkspaceMemberDTO | null> {
    if (!workspace) return null;

    const workspaceMemberEntity = await this.userService.loadWorkspaceMember(
      user,
      workspace,
    );

    if (!isDefined(workspaceMemberEntity)) {
      return null;
    }

    const workspaceId = workspace.id;
    const userWorkspace =
      await this.userWorkspaceService.getUserWorkspaceForUserOrThrow({
        userId: workspaceMemberEntity.userId,
        workspaceId: workspace.id,
      });

    const roleOfUserWorkspace =
      await this.userRoleService.getRolesByUserWorkspaces({
        userWorkspaceIds: [userWorkspace.id],
        workspaceId,
      });

    const userWorkspaceRoles = roleOfUserWorkspace.get(userWorkspace.id);

    if (!isDefined(userWorkspaceRoles)) {
      throw new Error('UserEntity workspace roles not found');
    }

    return this.workspaceMemberTranspiler.toWorkspaceMemberDto({
      workspaceMemberEntity,
      userWorkspace,
      userWorkspaceRoles,
    });
  }

  @ResolveField(() => [WorkspaceMemberDTO], {
    nullable: true,
  })
  async workspaceMembers(
    @Parent() _user: UserEntity,
    @AuthWorkspace({ allowUndefined: true })
    workspace: WorkspaceEntity | undefined,
  ): Promise<WorkspaceMemberDTO[]> {
    if (!workspace) return [];

    const workspaceMemberEntities = await this.userService.loadWorkspaceMembers(
      workspace,
      false,
    );

    const userWorkspaces = await this.userWorkspaceRepository.find({
      where: {
        userId: In(workspaceMemberEntities.map((entity) => entity.userId)),
        workspaceId: workspace.id,
      },
    });

    const userWorkspacesByUserIdMap = new Map<string, UserWorkspaceEntity>(
      userWorkspaces.map((userWorkspace) => [
        userWorkspace.userId,
        userWorkspace,
      ]),
    );

    const rolesByUserWorkspacesMap =
      await this.userRoleService.getRolesByUserWorkspaces({
        userWorkspaceIds: userWorkspaces.map(
          (userWorkspace) => userWorkspace.id,
        ),
        workspaceId: workspace.id,
      });

    const toWorkspaceMemberDtoArgs =
      workspaceMemberEntities.map<ToWorkspaceMemberDtoArgs>(
        (workspaceMemberEntity) => {
          const userWorkspace = userWorkspacesByUserIdMap.get(
            workspaceMemberEntity.userId,
          );

          if (!isDefined(userWorkspace)) {
            throw new Error('UserEntity workspace not found');
          }

          const userWorkspaceRoles = rolesByUserWorkspacesMap.get(
            userWorkspace.id,
          );

          if (!isDefined(userWorkspaceRoles)) {
            throw new Error('UserEntity workspace roles not found');
          }

          return {
            userWorkspace,
            userWorkspaceRoles,
            workspaceMemberEntity,
          };
        },
      );

    return this.workspaceMemberTranspiler.toWorkspaceMemberDtos(
      toWorkspaceMemberDtoArgs,
    );
  }

  @ResolveField(() => [DeletedWorkspaceMemberDTO], {
    nullable: true,
  })
  async deletedWorkspaceMembers(
    @Parent() _user: UserEntity,
    @AuthWorkspace({ allowUndefined: true })
    workspace: WorkspaceEntity | undefined,
  ): Promise<DeletedWorkspaceMemberDTO[]> {
    if (!workspace) return [];

    const workspaceMemberEntities =
      await this.userService.loadDeletedWorkspaceMembersOnly(workspace);

    return this.workspaceMemberTranspiler.toDeletedWorkspaceMemberDtos(
      workspaceMemberEntities,
      workspace.id,
    );
  }

  @ResolveField(() => Boolean, {
    name: 'hasPassword',
  })
  hasPassword(@Parent() user: UserEntity): boolean {
    return isDefined(user.passwordHash);
  }

  @ResolveField(() => String, {
    nullable: true,
  })
  supportUserHash(@Parent() parent: UserEntity): string | null {
    if (
      this.twentyConfigService.get('SUPPORT_DRIVER') !== SupportDriver.FRONT
    ) {
      return null;
    }
    const key = this.twentyConfigService.get('SUPPORT_FRONT_HMAC_KEY');

    return getHMACKey(parent.email, key);
  }

  @Mutation(() => UserEntity)
  @UseGuards(UserAuthGuard, NoPermissionGuard)
  async deleteUser(@AuthUser() { id: userId }: UserEntity) {
    return this.userService.deleteUser(userId);
  }

  @Mutation(() => UserWorkspaceEntity)
  @UseGuards(UserAuthGuard, CustomPermissionGuard)
  async deleteUserFromWorkspace(
    @Args('workspaceMemberIdToDelete') workspaceMemberIdToDelete: string,
    @AuthUser() { id: userId }: UserEntity,
    @AuthUserWorkspaceId() userWorkspaceId: string,
    @AuthWorkspace()
    workspace: WorkspaceEntity,
    @AuthApiKey() apiKey: ApiKeyEntity | undefined,
  ) {
    if (!workspace) {
      throw new AuthException(
        'Workspace not found',
        AuthExceptionCode.WORKSPACE_NOT_FOUND,
      );
    }

    const authContext = buildSystemAuthContext(workspace.id);

    const workspaceMemberToDelete =
      await this.globalWorkspaceOrmManager.executeInWorkspaceContext(
        authContext,
        async () => {
          const workspaceMemberRepository =
            await this.globalWorkspaceOrmManager.getRepository<WorkspaceMemberWorkspaceEntity>(
              workspace.id,
              'workspaceMember',
              { shouldBypassPermissionChecks: true },
            );

          return workspaceMemberRepository.findOne({
            where: {
              id: workspaceMemberIdToDelete,
            },
          });
        },
      );

    if (!isDefined(workspaceMemberToDelete)) {
      throw new BadRequestException(
        'Workspace member to delete not found in workspace',
      );
    }

    const workspaceMemberToDeleteIsAuthenticatedUser =
      workspaceMemberToDelete.userId === userId;

    const canDeleteUserFromWorkspace =
      workspaceMemberToDeleteIsAuthenticatedUser ||
      (await this.permissionsService.userHasWorkspaceSettingPermission({
        userWorkspaceId,
        workspaceId: workspace.id,
        setting: PermissionFlagType.WORKSPACE_MEMBERS,
        apiKeyId: apiKey?.id,
      }));

    if (!canDeleteUserFromWorkspace) {
      throw new PermissionsException(
        PermissionsExceptionMessage.PERMISSION_DENIED,
        PermissionsExceptionCode.PERMISSION_DENIED,
        {
          userFriendlyMessage: msg`You do not have permission to delete this user from the workspace. Please contact your workspace administrator for access.`,
        },
      );
    }

    return this.userService.deleteUserWorkspaceAndPotentiallyDeleteUser({
      userId: workspaceMemberToDelete.userId,
      workspaceId: workspace.id,
    });
  }

  @ResolveField(() => OnboardingStatus, {
    nullable: true,
  })
  async onboardingStatus(
    @Parent() user: UserEntity,
    @AuthWorkspace({ allowUndefined: true })
    workspace: WorkspaceEntity | undefined,
  ): Promise<OnboardingStatus | null> {
    if (!workspace) return null;

    return this.onboardingService.getOnboardingStatus(user, workspace);
  }

  @ResolveField(() => WorkspaceEntity, {
    nullable: true,
  })
  async currentWorkspace(
    @AuthWorkspace({ allowUndefined: true })
    workspace: WorkspaceEntity | undefined,
  ) {
    return workspace;
  }

  @ResolveField(() => [UserWorkspaceEntity], {
    nullable: false,
  })
  async workspaces(@Parent() user: UserEntity) {
    return user.userWorkspaces;
  }

  @ResolveField(() => AvailableWorkspaces)
  async availableWorkspaces(
    @AuthUser() user: UserEntity,
    @AuthProvider() authProvider: AuthProviderEnum,
  ): Promise<AvailableWorkspaces> {
    return this.userWorkspaceService.setLoginTokenToAvailableWorkspacesWhenAuthProviderMatch(
      await this.userWorkspaceService.findAvailableWorkspacesByEmail(
        user.email,
      ),
      user,
      authProvider,
    );
  }

  @Mutation(() => Boolean)
  @UseGuards(
    UserAuthGuard,
    WorkspaceAuthGuard,
    SettingsPermissionGuard(PermissionFlagType.PROFILE_INFORMATION),
  )
  async updateUserEmail(
    @Args() { newEmail, verifyEmailRedirectPath }: UpdateUserEmailInput,
    @AuthUser() user: UserEntity,
    @AuthWorkspace() workspace: WorkspaceEntity,
  ) {
    const editableFields = workspace.editableProfileFields || [];

    if (!editableFields.includes('email')) {
      throw new PermissionsException(
        PermissionsExceptionMessage.PERMISSION_DENIED,
        PermissionsExceptionCode.PERMISSION_DENIED,
      );
    }

    await this.userService.updateUserEmail({
      user,
      workspace,
      newEmail,
      verifyEmailRedirectPath,
    });

    return true;
  }
}
