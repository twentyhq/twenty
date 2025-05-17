/* eslint-disable @nx/workspace-inject-workspace-repository */
import { InjectRepository } from '@nestjs/typeorm';

import { TypeOrmQueryService } from '@ptc-org/nestjs-query-typeorm';
import { APP_LOCALES, SOURCE_LOCALE } from 'twenty-shared/translations';
import { isDefined } from 'twenty-shared/utils';
import { IsNull, Not, Repository } from 'typeorm';

import { FileFolder } from 'src/engine/core-modules/file/interfaces/file-folder.interface';

import { DatabaseEventAction } from 'src/engine/api/graphql/graphql-query-runner/enums/database-event-action';
import { USER_SIGNUP_EVENT_NAME } from 'src/engine/api/graphql/workspace-query-runner/constants/user-signup-event-name.constants';
import {
  AuthException,
  AuthExceptionCode,
} from 'src/engine/core-modules/auth/auth.exception';
import { AvailableWorkspaceOutput } from 'src/engine/core-modules/auth/dto/available-workspaces.output';
import { DomainManagerService } from 'src/engine/core-modules/domain-manager/services/domain-manager.service';
import { FileUploadService } from 'src/engine/core-modules/file/file-upload/services/file-upload.service';
import { FileService } from 'src/engine/core-modules/file/services/file.service';
import { UserWorkspace } from 'src/engine/core-modules/user-workspace/user-workspace.entity';
import { User } from 'src/engine/core-modules/user/user.entity';
import { userValidator } from 'src/engine/core-modules/user/user.validate';
import { WorkspaceInvitationService } from 'src/engine/core-modules/workspace-invitation/services/workspace-invitation.service';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { workspaceValidator } from 'src/engine/core-modules/workspace/workspace.validate';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import {
  PermissionsException,
  PermissionsExceptionCode,
  PermissionsExceptionMessage,
} from 'src/engine/metadata-modules/permissions/permissions.exception';
import { UserRoleService } from 'src/engine/metadata-modules/user-role/user-role.service';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';
import { WorkspaceEventEmitter } from 'src/engine/workspace-event-emitter/workspace-event-emitter';
import { WorkspaceMemberWorkspaceEntity } from 'src/modules/workspace-member/standard-objects/workspace-member.workspace-entity';
import { assert } from 'src/utils/assert';

export class UserWorkspaceService extends TypeOrmQueryService<UserWorkspace> {
  constructor(
    @InjectRepository(UserWorkspace, 'core')
    private readonly userWorkspaceRepository: Repository<UserWorkspace>,
    @InjectRepository(User, 'core')
    private readonly userRepository: Repository<User>,
    @InjectRepository(ObjectMetadataEntity, 'metadata')
    private readonly objectMetadataRepository: Repository<ObjectMetadataEntity>,

    private readonly workspaceInvitationService: WorkspaceInvitationService,
    private readonly workspaceEventEmitter: WorkspaceEventEmitter,
    private readonly domainManagerService: DomainManagerService,
    private readonly twentyORMGlobalManager: TwentyORMGlobalManager,
    private readonly userRoleService: UserRoleService,
    private readonly fileUploadService: FileUploadService,
    private readonly fileService: FileService,
  ) {
    super(userWorkspaceRepository);
  }

  async create({
    userId,
    workspaceId,
    isExistingUser,
    pictureUrl,
  }: {
    userId: string;
    workspaceId: string;
    isExistingUser: boolean;
    pictureUrl?: string;
  }): Promise<UserWorkspace> {
    const defaultAvatarUrl = await this.computeDefaultAvatarUrl(
      userId,
      workspaceId,
      isExistingUser,
      pictureUrl,
    );

    const userWorkspace = this.userWorkspaceRepository.create({
      userId,
      workspaceId,
      defaultAvatarUrl,
    });

    this.workspaceEventEmitter.emitCustomBatchEvent(
      USER_SIGNUP_EVENT_NAME,
      [{ userId }],
      workspaceId,
    );

    return this.userWorkspaceRepository.save(userWorkspace);
  }

  async createWorkspaceMember(workspaceId: string, user: User) {
    const workspaceMemberRepository =
      await this.twentyORMGlobalManager.getRepositoryForWorkspace<WorkspaceMemberWorkspaceEntity>(
        workspaceId,
        'workspaceMember',
        {
          shouldBypassPermissionChecks: true,
        },
      );

    const userWorkspace = await this.userWorkspaceRepository.findOneOrFail({
      where: {
        userId: user.id,
        workspaceId,
      },
    });

    await workspaceMemberRepository.insert({
      name: {
        firstName: user.firstName,
        lastName: user.lastName,
      },
      colorScheme: 'System',
      userId: user.id,
      userEmail: user.email,
      avatarUrl: userWorkspace.defaultAvatarUrl ?? '',
      locale: (user.locale ?? SOURCE_LOCALE) as keyof typeof APP_LOCALES,
    });

    const workspaceMember = await workspaceMemberRepository.find({
      where: {
        userId: user.id,
      },
    });

    assert(
      workspaceMember?.length === 1,
      `Error while creating workspace member ${user.email} on workspace ${workspaceId}`,
    );
    const objectMetadata = await this.objectMetadataRepository.findOneOrFail({
      where: {
        nameSingular: 'workspaceMember',
        workspaceId,
      },
    });

    this.workspaceEventEmitter.emitDatabaseBatchEvent({
      objectMetadataNameSingular: 'workspaceMember',
      action: DatabaseEventAction.CREATED,
      events: [
        {
          recordId: workspaceMember[0].id,
          objectMetadata,
          properties: {
            after: workspaceMember[0],
          },
        },
      ],
      workspaceId,
    });
  }

  async addUserToWorkspaceIfUserNotInWorkspace(
    user: User,
    workspace: Workspace,
  ) {
    let userWorkspace = await this.checkUserWorkspaceExists(
      user.id,
      workspace.id,
    );

    if (!userWorkspace) {
      userWorkspace = await this.create({
        userId: user.id,
        workspaceId: workspace.id,
        isExistingUser: true,
      });

      await this.createWorkspaceMember(workspace.id, user);

      const defaultRoleId = workspace.defaultRoleId;

      if (!isDefined(defaultRoleId)) {
        throw new PermissionsException(
          PermissionsExceptionMessage.DEFAULT_ROLE_NOT_FOUND,
          PermissionsExceptionCode.DEFAULT_ROLE_NOT_FOUND,
        );
      }

      await this.userRoleService.assignRoleToUserWorkspace({
        workspaceId: workspace.id,
        userWorkspaceId: userWorkspace.id,
        roleId: defaultRoleId,
      });

      await this.workspaceInvitationService.invalidateWorkspaceInvitation(
        workspace.id,
        user.email,
      );
    }
  }

  public async getUserCount(workspaceId: string): Promise<number | undefined> {
    return await this.userWorkspaceRepository.countBy({
      workspaceId,
    });
  }

  async checkUserWorkspaceExists(
    userId: string,
    workspaceId: string,
  ): Promise<UserWorkspace | null> {
    return this.userWorkspaceRepository.findOneBy({
      userId,
      workspaceId,
    });
  }

  async checkUserWorkspaceExistsByEmail(email: string, workspaceId: string) {
    return this.userWorkspaceRepository.exists({
      where: {
        workspaceId,
        user: {
          email,
        },
      },
      relations: {
        user: true,
      },
    });
  }

  async findFirstWorkspaceByUserId(userId: string) {
    const user = await this.userRepository.findOne({
      where: {
        id: userId,
      },
      relations: ['workspaces', 'workspaces.workspace'],
      order: {
        workspaces: {
          workspace: {
            createdAt: 'ASC',
          },
        },
      },
    });

    const workspace = user?.workspaces?.[0]?.workspace;

    workspaceValidator.assertIsDefinedOrThrow(
      workspace,
      new AuthException(
        'Workspace not found',
        AuthExceptionCode.WORKSPACE_NOT_FOUND,
      ),
    );

    return workspace;
  }

  async findAvailableWorkspacesByEmail(email: string) {
    const user = await this.userRepository.findOne({
      where: {
        email,
      },
      relations: [
        'workspaces',
        'workspaces.workspace',
        'workspaces.workspace.workspaceSSOIdentityProviders',
      ],
    });

    userValidator.assertIsDefinedOrThrow(
      user,
      new AuthException('User not found', AuthExceptionCode.USER_NOT_FOUND),
    );

    return user.workspaces.map<AvailableWorkspaceOutput>((userWorkspace) => ({
      id: userWorkspace.workspaceId,
      displayName: userWorkspace.workspace.displayName,
      workspaceUrls: this.domainManagerService.getWorkspaceUrls(
        userWorkspace.workspace,
      ),
      logo: userWorkspace.workspace.logo,
      sso: userWorkspace.workspace.workspaceSSOIdentityProviders.reduce(
        (acc, identityProvider) =>
          acc.concat(
            identityProvider.status === 'Inactive'
              ? []
              : [
                  {
                    id: identityProvider.id,
                    name: identityProvider.name,
                    issuer: identityProvider.issuer,
                    type: identityProvider.type,
                    status: identityProvider.status,
                  },
                ],
          ),
        [] as AvailableWorkspaceOutput['sso'],
      ),
    }));
  }

  async getUserWorkspaceForUserOrThrow({
    userId,
    workspaceId,
  }: {
    userId: string;
    workspaceId: string;
  }): Promise<UserWorkspace> {
    const userWorkspace = await this.userWorkspaceRepository.findOne({
      where: {
        userId,
        workspaceId,
      },
    });

    if (!isDefined(userWorkspace)) {
      throw new Error('User workspace not found');
    }

    return userWorkspace;
  }

  async getWorkspaceMemberOrThrow({
    workspaceMemberId,
    workspaceId,
  }: {
    workspaceMemberId: string;
    workspaceId: string;
  }): Promise<WorkspaceMemberWorkspaceEntity> {
    const workspaceMemberRepository =
      await this.twentyORMGlobalManager.getRepositoryForWorkspace<WorkspaceMemberWorkspaceEntity>(
        workspaceId,
        'workspaceMember',
      );

    const workspaceMember = await workspaceMemberRepository.findOne({
      where: {
        id: workspaceMemberId,
      },
    });

    if (!isDefined(workspaceMember)) {
      throw new Error('Workspace member not found');
    }

    return workspaceMember;
  }

  private async computeDefaultAvatarUrl(
    userId: string,
    workspaceId: string,
    isExistingUser: boolean,
    pictureUrl?: string,
  ) {
    if (isExistingUser) {
      const userWorkspace = await this.userWorkspaceRepository.findOne({
        where: {
          userId,
          defaultAvatarUrl: Not(IsNull()),
        },
        order: {
          createdAt: 'ASC',
        },
      });

      if (!isDefined(userWorkspace?.defaultAvatarUrl)) return;

      const [_, subFolder, filename] =
        await this.fileService.copyFileToNewWorkspace(
          userWorkspace.workspaceId,
          userWorkspace.defaultAvatarUrl,
          workspaceId,
        );

      return `${subFolder}/${filename}`;
    } else {
      if (!isDefined(pictureUrl)) return;

      const { paths } = await this.fileUploadService.uploadImageFromUrl({
        imageUrl: pictureUrl,
        fileFolder: FileFolder.ProfilePicture,
        workspaceId,
      });

      return paths[0];
    }
  }
}
