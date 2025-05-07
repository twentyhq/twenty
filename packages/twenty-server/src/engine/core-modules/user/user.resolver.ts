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
import { PermissionsOnAllObjectRecords } from 'twenty-shared/constants';
import { WorkspaceActivationStatus } from 'twenty-shared/workspace';
import { In, Repository } from 'typeorm';

import { FileFolder } from 'src/engine/core-modules/file/interfaces/file-folder.interface';
import { SupportDriver } from 'src/engine/core-modules/twenty-config/interfaces/support.interface';

import {
  AuthException,
  AuthExceptionCode,
} from 'src/engine/core-modules/auth/auth.exception';
import { DomainManagerService } from 'src/engine/core-modules/domain-manager/services/domain-manager.service';
import { FileUploadService } from 'src/engine/core-modules/file/file-upload/services/file-upload.service';
import { FileService } from 'src/engine/core-modules/file/services/file.service';
import { OnboardingStatus } from 'src/engine/core-modules/onboarding/enums/onboarding-status.enum';
import {
  OnboardingService,
  OnboardingStepKeys,
} from 'src/engine/core-modules/onboarding/onboarding.service';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { UserWorkspace } from 'src/engine/core-modules/user-workspace/user-workspace.entity';
import { WorkspaceMember } from 'src/engine/core-modules/user/dtos/workspace-member.dto';
import { UserService } from 'src/engine/core-modules/user/services/user.service';
import { UserVarsService } from 'src/engine/core-modules/user/user-vars/services/user-vars.service';
import { User } from 'src/engine/core-modules/user/user.entity';
import { userValidator } from 'src/engine/core-modules/user/user.validate';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { workspaceValidator } from 'src/engine/core-modules/workspace/workspace.validate';
import { AuthUser } from 'src/engine/decorators/auth/auth-user.decorator';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { OriginHeader } from 'src/engine/decorators/auth/origin-header.decorator';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';
import { SettingPermissionType } from 'src/engine/metadata-modules/permissions/constants/setting-permission-type.constants';
import { PermissionsService } from 'src/engine/metadata-modules/permissions/permissions.service';
import { PermissionsGraphqlApiExceptionFilter } from 'src/engine/metadata-modules/permissions/utils/permissions-graphql-api-exception.filter';
import { RoleDTO } from 'src/engine/metadata-modules/role/dtos/role.dto';
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
    private readonly fileService: FileService,
    private readonly domainManagerService: DomainManagerService,
    @InjectRepository(UserWorkspace, 'core')
    private readonly userWorkspaceRepository: Repository<UserWorkspace>,
    private readonly userRoleService: UserRoleService,
    private readonly permissionsService: PermissionsService,
  ) {}

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

    if (!currentUserWorkspace) {
      throw new Error('Current user workspace not found');
    }
    let settingsPermissions = {};
    let objectRecordsPermissions = {};

    if (
      ![
        WorkspaceActivationStatus.PENDING_CREATION,
        WorkspaceActivationStatus.ONGOING_CREATION,
      ].includes(workspace.activationStatus)
    ) {
      const permissions =
        await this.permissionsService.getUserWorkspacePermissions({
          userWorkspaceId: currentUserWorkspace.id,
          workspaceId: workspace.id,
        });

      settingsPermissions = permissions.settingsPermissions;
      objectRecordsPermissions = permissions.objectRecordsPermissions;
    }

    const grantedSettingsPermissions: SettingPermissionType[] = (
      Object.keys(settingsPermissions) as SettingPermissionType[]
    ).filter((feature) => settingsPermissions[feature] === true);

    const grantedObjectRecordsPermissions = (
      Object.keys(objectRecordsPermissions) as PermissionsOnAllObjectRecords[]
    ).filter((permission) => objectRecordsPermissions[permission] === true);

    currentUserWorkspace.settingsPermissions = grantedSettingsPermissions;
    currentUserWorkspace.objectRecordsPermissions =
      grantedObjectRecordsPermissions;
    user.currentUserWorkspace = currentUserWorkspace;

    return {
      ...user,
      currentWorkspace: workspace,
    };
  }

  @ResolveField(() => GraphQLJSONObject)
  async userVars(
    @Parent() user: User,
    @AuthWorkspace() workspace: Workspace,
  ): Promise<Record<string, any>> {
    const userVars = await this.userVarService.getAll({
      userId: user.id,
      workspaceId: workspace.id,
    });

    const userVarAllowList = [
      OnboardingStepKeys.ONBOARDING_CONNECT_ACCOUNT_PENDING,
      AccountsToReconnectKeys.ACCOUNTS_TO_RECONNECT_INSUFFICIENT_PERMISSIONS,
      AccountsToReconnectKeys.ACCOUNTS_TO_RECONNECT_EMAIL_ALIASES,
    ] as string[];

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
    const workspaceMember = await this.userService.loadWorkspaceMember(
      user,
      workspace,
    );

    if (workspaceMember && workspaceMember.avatarUrl) {
      const avatarUrlToken = this.fileService.encodeFileToken({
        workspaceMemberId: workspaceMember.id,
        workspaceId: workspace.id,
      });

      workspaceMember.avatarUrl = `${workspaceMember.avatarUrl}?token=${avatarUrlToken}`;
    }

    // TODO: Fix typing disrepency between Entity and DTO
    return workspaceMember as WorkspaceMember | null;
  }

  @ResolveField(() => [WorkspaceMember], {
    nullable: true,
  })
  async workspaceMembers(
    @Parent() user: User,
    @AuthWorkspace() workspace: Workspace,
  ): Promise<WorkspaceMember[]> {
    const workspaceMemberEntities =
      await this.userService.loadWorkspaceMembers(workspace);

    const workspaceMembers: WorkspaceMember[] = [];

    let userWorkspacesByUserId = new Map<string, UserWorkspace>();
    let rolesByUserWorkspaces = new Map<string, RoleDTO[]>();

    const userWorkspaces = await this.userWorkspaceRepository.find({
      where: {
        userId: In(workspaceMemberEntities.map((entity) => entity.userId)),
        workspaceId: workspace.id,
      },
    });

    userWorkspacesByUserId = new Map(
      userWorkspaces.map((userWorkspace) => [
        userWorkspace.userId,
        userWorkspace,
      ]),
    );

    rolesByUserWorkspaces = await this.userRoleService.getRolesByUserWorkspaces(
      {
        userWorkspaceIds: userWorkspaces.map(
          (userWorkspace) => userWorkspace.id,
        ),
        workspaceId: workspace.id,
      },
    );

    for (const workspaceMemberEntity of workspaceMemberEntities) {
      if (workspaceMemberEntity.avatarUrl) {
        const avatarUrlToken = this.fileService.encodeFileToken({
          workspaceMemberId: workspaceMemberEntity.id,
          workspaceId: workspace.id,
        });

        workspaceMemberEntity.avatarUrl = `${workspaceMemberEntity.avatarUrl}?token=${avatarUrlToken}`;
      }

      const workspaceMember = workspaceMemberEntity as WorkspaceMember;

      const userWorkspace = userWorkspacesByUserId.get(
        workspaceMemberEntity.userId,
      );

      if (!userWorkspace) {
        throw new Error('User workspace not found');
      }

      workspaceMember.userWorkspaceId = userWorkspace.id;

      const workspaceMemberRoles = (
        rolesByUserWorkspaces.get(userWorkspace.id) ?? []
      ).map((roleEntity) => {
        return {
          id: roleEntity.id,
          label: roleEntity.label,
          canUpdateAllSettings: roleEntity.canUpdateAllSettings,
          description: roleEntity.description,
          icon: roleEntity.icon,
          isEditable: roleEntity.isEditable,
          userWorkspaceRoles: roleEntity.userWorkspaceRoles,
          canReadAllObjectRecords: roleEntity.canReadAllObjectRecords,
          canUpdateAllObjectRecords: roleEntity.canUpdateAllObjectRecords,
          canSoftDeleteAllObjectRecords:
            roleEntity.canSoftDeleteAllObjectRecords,
          canDestroyAllObjectRecords: roleEntity.canDestroyAllObjectRecords,
        };
      });

      workspaceMember.roles = workspaceMemberRoles;

      workspaceMembers.push(workspaceMember);
    }

    // TODO: Fix typing disrepency between Entity and DTO
    return workspaceMembers;
  }

  @ResolveField(() => String, {
    nullable: true,
  })
  supportUserHash(@Parent() parent: User): string | null {
    if (
      this.twentyConfigService.get('SUPPORT_DRIVER') !== SupportDriver.Front
    ) {
      return null;
    }
    const key = this.twentyConfigService.get('SUPPORT_FRONT_HMAC_KEY');

    return getHMACKey(parent.email, key);
  }

  @Mutation(() => String)
  async uploadProfilePicture(
    @AuthUser() { id }: User,
    @AuthWorkspace() { id: workspaceId }: Workspace,
    @Args({ name: 'file', type: () => GraphQLUpload })
    { createReadStream, filename, mimetype }: FileUpload,
  ): Promise<string> {
    if (!id) {
      throw new Error('User not found');
    }

    const stream = createReadStream();
    const buffer = await streamToBuffer(stream);
    const fileFolder = FileFolder.ProfilePicture;

    const { paths } = await this.fileUploadService.uploadImage({
      file: buffer,
      filename,
      mimeType: mimetype,
      fileFolder,
      workspaceId,
    });

    const fileToken = this.fileService.encodeFileToken({
      workspaceId: workspaceId,
    });

    return `${paths[0]}?token=${fileToken}`;
  }

  @Mutation(() => User)
  async deleteUser(@AuthUser() { id: userId }: User) {
    // Proceed with user deletion
    return this.userService.deleteUser(userId);
  }

  @ResolveField(() => OnboardingStatus)
  async onboardingStatus(
    @Parent() user: User,
    @OriginHeader() origin: string,
  ): Promise<OnboardingStatus> {
    const workspace =
      await this.domainManagerService.getWorkspaceByOriginOrDefaultWorkspace(
        origin,
      );

    workspaceValidator.assertIsDefinedOrThrow(workspace);

    return this.onboardingService.getOnboardingStatus(user, workspace);
  }

  @ResolveField(() => Workspace)
  async currentWorkspace(@AuthWorkspace() workspace: Workspace) {
    return workspace;
  }
}
