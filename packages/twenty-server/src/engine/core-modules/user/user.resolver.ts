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
import { FeatureFlagKey } from 'src/engine/core-modules/feature-flag/enums/feature-flag-key.enum';
import { FeatureFlagService } from 'src/engine/core-modules/feature-flag/services/feature-flag.service';
import { SignedFileDTO } from 'src/engine/core-modules/file/file-upload/dtos/signed-file.dto';
import { FileUploadService } from 'src/engine/core-modules/file/file-upload/services/file-upload.service';
import { OnboardingStatus } from 'src/engine/core-modules/onboarding/enums/onboarding-status.enum';
import {
  OnboardingService,
  OnboardingStepKeys,
} from 'src/engine/core-modules/onboarding/onboarding.service';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
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
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthUser } from 'src/engine/decorators/auth/auth-user.decorator';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
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

@UseGuards(WorkspaceAuthGuard)
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

    const isPermissionsV2Enabled =
      await this.featureFlagService.isFeatureEnabled(
        FeatureFlagKey.IS_PERMISSIONS_V2_ENABLED,
        workspace.id,
      );

    if (!isPermissionsV2Enabled) {
      return await this.permissionsService.getUserWorkspacePermissions({
        userWorkspaceId: currentUserWorkspace.id,
        workspaceId: workspace.id,
      });
    }

    return await this.permissionsService.getUserWorkspacePermissionsV2({
      userWorkspaceId: currentUserWorkspace.id,
      workspaceId: workspace.id,
    });
  }

  @Query(() => User)
  async currentUser(
    @AuthUser() { id: userId }: User,
    @AuthWorkspace() workspace: Workspace,
  ): Promise<User> {
    const user = await this.userRepository.findOne({
      where: {
        id: userId,
      },
      relations: ['workspaces', 'workspaces.workspace'],
    });

    userValidator.assertIsDefinedOrThrow(
      user,
      new AuthException('User not found', AuthExceptionCode.USER_NOT_FOUND),
    );

    const currentUserWorkspace = user.workspaces.find(
      (userWorkspace) => userWorkspace.workspace.id === workspace.id,
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

    return {
      ...user,
      currentUserWorkspace: {
        ...currentUserWorkspace,
        ...userWorkspacePermissions,
      },
      currentWorkspace: workspace,
    };
  }

  @ResolveField(() => GraphQLJSONObject)
  async userVars(
    @Parent() user: User,
    @AuthWorkspace() workspace: Workspace,
  ): Promise<Record<string, unknown>> {
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
    @AuthWorkspace() workspace: Workspace,
  ): Promise<WorkspaceMember | null> {
    const workspaceMemberEntity = await this.userService.loadWorkspaceMember(
      user,
      workspace,
    );

    if (!isDefined(workspaceMemberEntity)) {
      return null
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
    @AuthWorkspace() workspace: Workspace,
  ): Promise<WorkspaceMember[]> {
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
    @AuthWorkspace() workspace: Workspace,
  ): Promise<DeletedWorkspaceMember[]> {
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
  async uploadProfilePicture(
    @AuthUser() { id }: User,
    @AuthWorkspace() { id: workspaceId }: Workspace,
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
  async deleteUser(@AuthUser() { id: userId }: User) {
    return this.userService.deleteUser(userId);
  }

  @ResolveField(() => OnboardingStatus)
  async onboardingStatus(
    @Parent() user: User,
    @AuthWorkspace() workspace: Workspace,
  ): Promise<OnboardingStatus> {
    return this.onboardingService.getOnboardingStatus(user, workspace);
  }

  @ResolveField(() => Workspace)
  async currentWorkspace(@AuthWorkspace() workspace: Workspace) {
    return workspace;
  }
}
