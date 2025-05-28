import { InjectRepository } from '@nestjs/typeorm';

import assert from 'assert';

import { TypeOrmQueryService } from '@ptc-org/nestjs-query-typeorm';
import { PermissionsOnAllObjectRecords } from 'twenty-shared/constants';
import {
  isWorkspaceActiveOrSuspended,
  WorkspaceActivationStatus,
} from 'twenty-shared/workspace';
import { IsNull, Not, Repository } from 'typeorm';
import { isDefined } from 'twenty-shared/utils';

import { DatabaseEventAction } from 'src/engine/api/graphql/graphql-query-runner/enums/database-event-action';
import { AppToken } from 'src/engine/core-modules/app-token/app-token.entity';
import {
  AuthException,
  AuthExceptionCode,
} from 'src/engine/core-modules/auth/auth.exception';
import { ApprovedAccessDomainService } from 'src/engine/core-modules/approved-access-domain/services/approved-access-domain.service';
import { DomainManagerService } from 'src/engine/core-modules/domain-manager/services/domain-manager.service';
import { UserWorkspaceService } from 'src/engine/core-modules/user-workspace/user-workspace.service';
import { UserWorkspace } from 'src/engine/core-modules/user-workspace/user-workspace.entity';
import { AvailableWorkspacesToJoin } from 'src/engine/core-modules/user/dtos/available-workspaces-to-join';
import { User } from 'src/engine/core-modules/user/user.entity';
import { userValidator } from 'src/engine/core-modules/user/user.validate';
import { WorkspaceInvitationService } from 'src/engine/core-modules/workspace-invitation/services/workspace-invitation.service';
import { WorkspaceService } from 'src/engine/core-modules/workspace/services/workspace.service';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { DataSourceService } from 'src/engine/metadata-modules/data-source/data-source.service';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { SettingPermissionType } from 'src/engine/metadata-modules/permissions/constants/setting-permission-type.constants';
import { PermissionsService } from 'src/engine/metadata-modules/permissions/permissions.service';
import {
  PermissionsException,
  PermissionsExceptionCode,
  PermissionsExceptionMessage,
} from 'src/engine/metadata-modules/permissions/permissions.exception';
import { UserRoleService } from 'src/engine/metadata-modules/user-role/user-role.service';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';
import { WorkspaceEventEmitter } from 'src/engine/workspace-event-emitter/workspace-event-emitter';
import { WorkspaceMemberWorkspaceEntity } from 'src/modules/workspace-member/standard-objects/workspace-member.workspace-entity';
import { getDomainNameByEmail } from 'src/utils/get-domain-name-by-email';
import { SignedFileDTO } from 'src/engine/core-modules/file/file-upload/dtos/signed-file.dto';

// eslint-disable-next-line @nx/workspace-inject-workspace-repository
export class UserService extends TypeOrmQueryService<User> {
  constructor(
    @InjectRepository(User, 'core')
    private readonly userRepository: Repository<User>,
    @InjectRepository(ObjectMetadataEntity, 'metadata')
    private readonly objectMetadataRepository: Repository<ObjectMetadataEntity>,
    @InjectRepository(UserWorkspace, 'core')
    private readonly userWorkspaceRepository: Repository<UserWorkspace>,
    private readonly dataSourceService: DataSourceService,
    private readonly workspaceEventEmitter: WorkspaceEventEmitter,
    private readonly workspaceService: WorkspaceService,
    private readonly twentyORMGlobalManager: TwentyORMGlobalManager,
    private readonly userRoleService: UserRoleService,
    private readonly userWorkspaceService: UserWorkspaceService,
    private readonly permissionsService: PermissionsService,
    private readonly approvedAccessDomainService: ApprovedAccessDomainService,
    private readonly workspaceInvitationService: WorkspaceInvitationService,
    private readonly domainManagerService: DomainManagerService,
  ) {
    super(userRepository);
  }

  async loadWorkspaceMember(user: User, workspace: Workspace) {
    if (!isWorkspaceActiveOrSuspended(workspace)) {
      return null;
    }

    const workspaceMemberRepository =
      await this.twentyORMGlobalManager.getRepositoryForWorkspace<WorkspaceMemberWorkspaceEntity>(
        workspace.id,
        'workspaceMember',
      );

    return await workspaceMemberRepository.findOne({
      where: {
        userId: user.id,
      },
    });
  }

  async loadWorkspaceMembers(workspace: Workspace, withDeleted = false) {
    if (!isWorkspaceActiveOrSuspended(workspace)) {
      return [];
    }

    const workspaceMemberRepository =
      await this.twentyORMGlobalManager.getRepositoryForWorkspace<WorkspaceMemberWorkspaceEntity>(
        workspace.id,
        'workspaceMember',
      );

    return await workspaceMemberRepository.find({ withDeleted: withDeleted });
  }

  async loadDeletedWorkspaceMembersOnly(workspace: Workspace) {
    if (!isWorkspaceActiveOrSuspended(workspace)) {
      return [];
    }

    const workspaceMemberRepository =
      await this.twentyORMGlobalManager.getRepositoryForWorkspace<WorkspaceMemberWorkspaceEntity>(
        workspace.id,
        'workspaceMember',
      );

    return await workspaceMemberRepository.find({
      where: { deletedAt: Not(IsNull()) },
      withDeleted: true,
    });
  }

  private async deleteUserFromWorkspace({
    userId,
    workspaceId,
  }: {
    userId: string;
    workspaceId: string;
  }) {
    const workspaceMemberRepository =
      await this.twentyORMGlobalManager.getRepositoryForWorkspace<WorkspaceMemberWorkspaceEntity>(
        workspaceId,
        'workspaceMember',
        {
          shouldBypassPermissionChecks: true,
        },
      );

    const workspaceMembers = await workspaceMemberRepository.find();

    if (workspaceMembers.length > 1) {
      const userWorkspace =
        await this.userWorkspaceService.getUserWorkspaceForUserOrThrow({
          userId,
          workspaceId,
        });

      await this.userRoleService.validateUserWorkspaceIsNotUniqueAdminOrThrow({
        workspaceId,
        userWorkspaceId: userWorkspace.id,
      });
    }

    const workspaceMember = workspaceMembers.filter(
      (member: WorkspaceMemberWorkspaceEntity) => member.userId === userId,
    )?.[0];

    assert(workspaceMember, 'WorkspaceMember not found');

    await workspaceMemberRepository.delete({ userId });

    const objectMetadata = await this.objectMetadataRepository.findOneOrFail({
      where: {
        nameSingular: 'workspaceMember',
        workspaceId,
      },
    });

    if (workspaceMembers.length === 1) {
      await this.workspaceService.deleteWorkspace(workspaceId);

      return;
    }

    this.workspaceEventEmitter.emitDatabaseBatchEvent({
      objectMetadataNameSingular: 'workspaceMember',
      action: DatabaseEventAction.DELETED,
      events: [
        {
          recordId: workspaceMember.id,
          objectMetadata,
          properties: {
            before: workspaceMember,
          },
        },
      ],
      workspaceId,
    });
  }

  async deleteUser(userId: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: {
        id: userId,
      },
      relations: ['workspaces'],
    });

    userValidator.assertIsDefinedOrThrow(user);

    await Promise.all(
      user.workspaces.map(async (userWorkspace) => {
        try {
          await this.deleteUserFromWorkspace({
            userId,
            workspaceId: userWorkspace.workspaceId,
          });
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (error: any) {
          if (
            error instanceof PermissionsException &&
            error.code === PermissionsExceptionCode.CANNOT_UNASSIGN_LAST_ADMIN
          ) {
            throw new PermissionsException(
              PermissionsExceptionMessage.CANNOT_DELETE_LAST_ADMIN_USER,
              PermissionsExceptionCode.CANNOT_DELETE_LAST_ADMIN_USER,
            );
          }
          throw error;
        }
      }),
    );

    return user;
  }

  async hasUserAccessToWorkspaceOrThrow(userId: string, workspaceId: string) {
    const user = await this.userRepository.findOne({
      where: {
        id: userId,
        workspaces: {
          workspaceId,
        },
      },
      relations: ['workspaces'],
    });

    userValidator.assertIsDefinedOrThrow(
      user,
      new AuthException(
        'User does not have access to this workspace',
        AuthExceptionCode.FORBIDDEN_EXCEPTION,
      ),
    );
  }

  async getUserByEmail(email: string) {
    const user = await this.userRepository.findOne({
      where: {
        email,
      },
    });

    userValidator.assertIsDefinedOrThrow(user);

    return user;
  }

  async markEmailAsVerified(userId: string) {
    const user = await this.userRepository.findOne({
      where: {
        id: userId,
      },
    });

    userValidator.assertIsDefinedOrThrow(user);

    user.isEmailVerified = true;

    return await this.userRepository.save(user);
  }

  async getCurrentUser(userId: string, workspace: Workspace): Promise<User> {
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

    user.currentUserWorkspace = await this.processUserWorkspacePermissions(
      currentUserWorkspace,
      workspace,
    );

    const availableWorkspaces = await this.getUserAvailableWorkspaces(user);

    return {
      ...user,
      currentWorkspace: workspace,
      availableWorkspaces: [
        ...new Map(availableWorkspaces.map((item) => [item.id, item])).values(),
      ],
    };
  }

  private async processUserWorkspacePermissions(
    currentUserWorkspace: UserWorkspace,
    workspace: Workspace,
  ): Promise<void> {
    let settingsPermissions: Partial<Record<SettingPermissionType, boolean>> =
      {};
    let objectRecordsPermissions: Partial<
      Record<PermissionsOnAllObjectRecords, boolean>
    > = {};
    let objectPermissions: ObjectPermissionDTO[] = [];

    if (
      ![
        WorkspaceActivationStatus.PENDING_CREATION,
        WorkspaceActivationStatus.ONGOING_CREATION,
      ].includes(workspace.activationStatus)
    ) {
      const isPermissionsV2Enabled =
        await this.featureFlagService.isFeatureEnabled(
          FeatureFlagKey.IsPermissionsV2Enabled,
          workspace.id,
        );

      if (isPermissionsV2Enabled) {
        const permissions =
          await this.permissionsService.getUserWorkspacePermissionsV2({
            userWorkspaceId: currentUserWorkspace.id,
            workspaceId: workspace.id,
          });

        settingsPermissions = permissions.settingsPermissions;
        objectPermissions = Object.entries(
          permissions.objectRecordsPermissions,
        ).map(([objectMetadataId, permissions]) => ({
          objectMetadataId,
          canReadObjectRecords: permissions.canRead,
          canUpdateObjectRecords: permissions.canUpdate,
          canSoftDeleteObjectRecords: permissions.canSoftDelete,
          canDestroyObjectRecords: permissions.canDestroy,
        }));
        objectRecordsPermissions = permissions.objectRecordsPermissions;
      } else {
        const permissions =
          await this.permissionsService.getUserWorkspacePermissions({
            userWorkspaceId: currentUserWorkspace.id,
            workspaceId: workspace.id,
          });

        settingsPermissions = permissions.settingsPermissions;
        objectRecordsPermissions = permissions.objectRecordsPermissions;
      }
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
    currentUserWorkspace.objectPermissions = objectPermissions;

    return currentUserWorkspace;
  }

  private async getUserAvailableWorkspaces(
    user: User,
  ): Promise<AvailableWorkspacesToJoin[]> {
    const domain = getDomainNameByEmail(user.email);
    const userWorkspaceIds = user.workspaces.map(
      ({ workspaceId }) => workspaceId,
    );

    const [approvedDomainWorkspaces, invitedWorkspaces] = await Promise.all([
      (
        await this.approvedAccessDomainService.findValidatedApprovedAccessDomainWithWorkspaceByDomain(
          domain,
        )
      ).map(({ workspace }) =>
        this.mapWorkspaceToAvailableWorkspace(workspace),
      ),
      (
        await this.workspaceInvitationService.findInvitationsByEmail(user.email)
      ).map((appToken) =>
        this.mapWorkspaceToAvailableWorkspace(appToken.workspace, appToken),
      ),
    ]);

    return [...approvedDomainWorkspaces, ...invitedWorkspaces].filter(
      ({ id }) => !userWorkspaceIds.includes(id),
    );
  }

  private mapWorkspaceToAvailableWorkspace(
    workspace: Workspace,
    appToken?: AppToken,
  ): AvailableWorkspacesToJoin {
    return {
      id: workspace.id,
      logo: workspace.logo,
      displayName: workspace.displayName,
      workspaceUrl: this.domainManagerService
        .buildWorkspaceURL({
          workspace,
          pathname: appToken ? `invite/${workspace.inviteHash}` : '',
          searchParams: isDefined(appToken?.context?.email)
            ? {
                inviteToken: appToken.value,
                email: appToken.context.email,
              }
            : {},
        })
        .toString(),
    };
  }
}
