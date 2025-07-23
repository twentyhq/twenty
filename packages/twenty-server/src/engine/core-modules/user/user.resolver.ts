import { UseFilters, UseGuards } from '@nestjs/common';
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

import { GraphQLJSONObject } from 'graphql-type-json';
import { FileUpload, GraphQLUpload } from 'graphql-upload';
import { isDefined } from 'twenty-shared/utils';
import { WorkspaceActivationStatus } from 'twenty-shared/workspace';
import { In, Repository } from 'typeorm';

import { FileFolder } from 'src/engine/core-modules/file/interfaces/file-folder.interface';
import { SupportDriver } from 'src/engine/core-modules/twenty-config/interfaces/support.interface';

import {
  AuthException,
  AuthExceptionCode,
} from 'src/engine/core-modules/auth/auth.exception';
import { AvailableWorkspaces } from 'src/engine/core-modules/auth/dto/available-workspaces.output';
import { FeatureFlagService } from 'src/engine/core-modules/feature-flag/services/feature-flag.service';
import { SignedFileDTO } from 'src/engine/core-modules/file/file-upload/dtos/signed-file.dto';
import { FileUploadService } from 'src/engine/core-modules/file/file-upload/services/file-upload.service';
import { OnboardingStatus } from 'src/engine/core-modules/onboarding/enums/onboarding-status.enum';
import {
  OnboardingService,
  OnboardingStepKeys,
} from 'src/engine/core-modules/onboarding/onboarding.service';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { buildTwoFactorAuthenticationMethodSummary } from 'src/engine/core-modules/two-factor-authentication/utils/two-factor-authentication-method.presenter';
import { UserWorkspace } from 'src/engine/core-modules/user-workspace/user-workspace.entity';
import { UserWorkspaceService } from 'src/engine/core-modules/user-workspace/user-workspace.service';
import { DeletedWorkspaceMember } from 'src/engine/core-modules/user/dtos/deleted-workspace-member.dto';
import { WorkspaceMember } from 'src/engine/core-modules/user/dtos/workspace-member.dto';
import { UserService } from 'src/engine/core-modules/user/services/user.service';
import {
  ToWorkspaceMemberDtoArgs,
  WorkspaceMemberTranspiler,
} from 'src/engine/core-modules/user/services/workspace-member-transpiler.service';
import { UserVarsService } from 'src/engine/core-modules/user/user-vars/services/user-vars.service';
import { User } from 'src/engine/core-modules/user/user.entity';
import { userValidator } from 'src/engine/core-modules/user/user.validate';
import { AuthProviderEnum } from 'src/engine/core-modules/workspace/types/workspace.type';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthProvider } from 'src/engine/decorators/auth/auth-provider.decorator';
import { AuthUser } from 'src/engine/decorators/auth/auth-user.decorator';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { UserAuthGuard } from 'src/engine/guards/user-auth.guard';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';
import { PermissionsService } from 'src/engine/metadata-modules/permissions/permissions.service';
import { UserWorkspacePermissions } from 'src/engine/metadata-modules/permissions/types/user-workspace-permissions';
import { PermissionsGraphqlApiExceptionFilter } from 'src/engine/metadata-modules/permissions/utils/permissions-graphql-api-exception.filter';
import { fromUserWorkspacePermissionsToUserWorkspacePermissionsDto } from 'src/engine/metadata-modules/role/utils/fromUserWorkspacePermissionsToUserWorkspacePermissionsDto';
import { UserRoleService } from 'src/engine/metadata-modules/user-role/user-role.service';
import { AccountsToReconnectKeys } from 'src/modules/connected-account/types/accounts-to-reconnect-key-value.type';
import { streamToBuffer } from 'src/utils/stream-to-buffer';

const getHMACKey = (email?: string, key?: string | null) => {
  if (!email || !key) return null;

  const hmac = crypto.createHmac('sha256', key);

  return hmac.update(email).digest('hex');
};

@Resolver(() => User)
@UseFilters(PermissionsGraphqlApiExceptionFilter)
export class UserResolver {
  constructor(
    @InjectRepository(User, 'core')
    private readonly userRepository: Repository<User>,
    private readonly userService: UserService,
    private readonly twentyConfigService: TwentyConfigService,
    private readonly fileUploadService: FileUploadService,
    private readonly onboardingService: OnboardingService,
    private readonly userVarService: UserVarsService,
    @InjectRepository(UserWorkspace, 'core')
    private readonly userWorkspaceRepository: Repository<UserWorkspace>,
    private readonly userRoleService: UserRoleService,
    private readonly permissionsService: PermissionsService,
    private readonly featureFlagService: FeatureFlagService,
    private readonly workspaceMemberTranspiler: WorkspaceMemberTranspiler,
    private readonly userWorkspaceService: UserWorkspaceService,
  ) {}

  private async getUserWorkspacePermissions({
    currentUserWorkspace,
    workspace,
  }: {
    workspace: Workspace;
    currentUserWorkspace: UserWorkspace;
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

  @Query(() => User)
  @UseGuards(UserAuthGuard)
  async currentUser(
    @AuthUser() { id: userId }: User,
    @AuthWorkspace({ allowUndefined: true }) workspace: Workspace,
  ): Promise<User> {
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
      new AuthException('User not found', AuthExceptionCode.USER_NOT_FOUND),
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
    @Parent() user: User,
    @AuthWorkspace({ allowUndefined: true }) workspace: Workspace | undefined,
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

  @ResolveField(() => WorkspaceMember, {
    nullable: true,
  })
  async workspaceMember(
    @Parent() user: User,
    @AuthWorkspace({ allowUndefined: true }) workspace: Workspace | undefined,
  ): Promise<WorkspaceMember | null> {
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
      throw new Error('User workspace roles not found');
    }

    return this.workspaceMemberTranspiler.toWorkspaceMemberDto({
      workspaceMemberEntity,
      userWorkspace,
      userWorkspaceRoles,
    });
  }

  @ResolveField(() => [WorkspaceMember], {
    nullable: true,
  })
  async workspaceMembers(
    @Parent() _user: User,
    @AuthWorkspace({ allowUndefined: true }) workspace: Workspace | undefined,
  ): Promise<WorkspaceMember[]> {
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

    const userWorkspacesByUserIdMap = new Map<string, UserWorkspace>(
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
            throw new Error('User workspace not found');
          }

          const userWorkspaceRoles = rolesByUserWorkspacesMap.get(
            userWorkspace.id,
          );

          if (!isDefined(userWorkspaceRoles)) {
            throw new Error('User workspace roles not found');
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

  @ResolveField(() => [DeletedWorkspaceMember], {
    nullable: true,
  })
  async deletedWorkspaceMembers(
    @Parent() _user: User,
    @AuthWorkspace({ allowUndefined: true }) workspace: Workspace | undefined,
  ): Promise<DeletedWorkspaceMember[]> {
    if (!workspace) return [];

    const workspaceMemberEntities =
      await this.userService.loadDeletedWorkspaceMembersOnly(workspace);

    return this.workspaceMemberTranspiler.toDeletedWorkspaceMemberDtos(
      workspaceMemberEntities,
      workspace.id,
    );
  }

  @ResolveField(() => String, {
    nullable: true,
  })
  supportUserHash(@Parent() parent: User): string | null {
    if (
      this.twentyConfigService.get('SUPPORT_DRIVER') !== SupportDriver.FRONT
    ) {
      return null;
    }
    const key = this.twentyConfigService.get('SUPPORT_FRONT_HMAC_KEY');

    return getHMACKey(parent.email, key);
  }

  @Mutation(() => SignedFileDTO)
  @UseGuards(WorkspaceAuthGuard)
  async uploadProfilePicture(
    @AuthUser() { id }: User,
    @AuthWorkspace({ allowUndefined: true }) { id: workspaceId }: Workspace,
    @Args({ name: 'file', type: () => GraphQLUpload })
    { createReadStream, filename, mimetype }: FileUpload,
  ): Promise<SignedFileDTO> {
    if (!id) {
      throw new Error('User not found');
    }

    const stream = createReadStream();
    const buffer = await streamToBuffer(stream);
    const fileFolder = FileFolder.ProfilePicture;

    const { files } = await this.fileUploadService.uploadImage({
      file: buffer,
      filename,
      mimeType: mimetype,
      fileFolder,
      workspaceId,
    });

    if (!files.length) {
      throw new Error('Failed to upload profile picture');
    }

    return files[0];
  }

  @Mutation(() => User)
  @UseGuards(UserAuthGuard)
  async deleteUser(@AuthUser() { id: userId }: User) {
    return this.userService.deleteUser(userId);
  }

  @ResolveField(() => OnboardingStatus, {
    nullable: true,
  })
  async onboardingStatus(
    @Parent() user: User,
    @AuthWorkspace({ allowUndefined: true }) workspace: Workspace | undefined,
  ): Promise<OnboardingStatus | null> {
    if (!workspace) return null;

    return this.onboardingService.getOnboardingStatus(user, workspace);
  }

  @ResolveField(() => Workspace, {
    nullable: true,
  })
  async currentWorkspace(
    @AuthWorkspace({ allowUndefined: true }) workspace: Workspace | undefined,
  ) {
    return workspace;
  }

  @ResolveField(() => [UserWorkspace], {
    nullable: false,
  })
  async workspaces(@Parent() user: User) {
    return user.userWorkspaces;
  }

  @ResolveField(() => AvailableWorkspaces)
  async availableWorkspaces(
    @AuthUser() user: User,
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
}
