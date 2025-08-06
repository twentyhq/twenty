/* eslint-disable @nx/workspace-inject-workspace-repository */
import { InjectRepository } from '@nestjs/typeorm';

import { TypeOrmQueryService } from '@ptc-org/nestjs-query-typeorm';
import { APP_LOCALES, SOURCE_LOCALE } from 'twenty-shared/translations';
import { isDefined } from 'twenty-shared/utils';
import { IsNull, Not, Repository } from 'typeorm';

import { FileStorageExceptionCode } from 'src/engine/core-modules/file-storage/interfaces/file-storage-exception';
import { FileFolder } from 'src/engine/core-modules/file/interfaces/file-folder.interface';

import { AppToken } from 'src/engine/core-modules/app-token/app-token.entity';
import { ApprovedAccessDomainService } from 'src/engine/core-modules/approved-access-domain/services/approved-access-domain.service';
import {
  AuthException,
  AuthExceptionCode,
} from 'src/engine/core-modules/auth/auth.exception';
import { AvailableWorkspace } from 'src/engine/core-modules/auth/dto/available-workspaces.output';
import { LoginTokenService } from 'src/engine/core-modules/auth/token/services/login-token.service';
import { DomainManagerService } from 'src/engine/core-modules/domain-manager/services/domain-manager.service';
import { FileUploadService } from 'src/engine/core-modules/file/file-upload/services/file-upload.service';
import { FileService } from 'src/engine/core-modules/file/services/file.service';
import { UserWorkspace } from 'src/engine/core-modules/user-workspace/user-workspace.entity';
import { User } from 'src/engine/core-modules/user/user.entity';
import { WorkspaceInvitationService } from 'src/engine/core-modules/workspace-invitation/services/workspace-invitation.service';
import { AuthProviderEnum } from 'src/engine/core-modules/workspace/types/workspace.type';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { workspaceValidator } from 'src/engine/core-modules/workspace/workspace.validate';
import {
  PermissionsException,
  PermissionsExceptionCode,
  PermissionsExceptionMessage,
} from 'src/engine/metadata-modules/permissions/permissions.exception';
import { UserRoleService } from 'src/engine/metadata-modules/user-role/user-role.service';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';
import { WorkspaceMemberWorkspaceEntity } from 'src/modules/workspace-member/standard-objects/workspace-member.workspace-entity';
import { assert } from 'src/utils/assert';
import { getDomainNameByEmail } from 'src/utils/get-domain-name-by-email';

export class UserWorkspaceService extends TypeOrmQueryService<UserWorkspace> {
  constructor(
    @InjectRepository(UserWorkspace, 'core')
    private readonly userWorkspaceRepository: Repository<UserWorkspace>,
    @InjectRepository(User, 'core')
    private readonly userRepository: Repository<User>,
    private readonly workspaceInvitationService: WorkspaceInvitationService,
    private readonly domainManagerService: DomainManagerService,
    private readonly loginTokenService: LoginTokenService,
    private readonly approvedAccessDomainService: ApprovedAccessDomainService,
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

    return this.userWorkspaceRepository.save(userWorkspace);
  }

  async createWorkspaceMember(workspaceId: string, user: User) {
    const workspaceMemberRepository =
      await this.twentyORMGlobalManager.getRepositoryForWorkspace<WorkspaceMemberWorkspaceEntity>(
        workspaceId,
        'workspaceMember',
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
      relations: { userWorkspaces: { workspace: true } },
      order: {
        userWorkspaces: {
          workspace: {
            createdAt: 'ASC',
          },
        },
      },
    });

    const workspace = user?.userWorkspaces?.[0]?.workspace;

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
      relations: {
        userWorkspaces: {
          workspace: {
            workspaceSSOIdentityProviders: true,
            approvedAccessDomains: true,
          },
        },
      },
    });

    const alreadyMemberWorkspaces = user
      ? user.userWorkspaces.map(({ workspace }) => ({ workspace }))
      : [];

    const alreadyMemberWorkspacesIds = alreadyMemberWorkspaces.map(
      ({ workspace }) => workspace.id,
    );

    const workspacesFromApprovedAccessDomain = (
      await this.approvedAccessDomainService.findValidatedApprovedAccessDomainWithWorkspacesAndSSOIdentityProvidersDomain(
        getDomainNameByEmail(email),
      )
    )
      .filter(
        ({ workspace }) => !alreadyMemberWorkspacesIds.includes(workspace.id),
      )
      .map(({ workspace }) => ({ workspace }));

    const workspacesFromApprovedAccessDomainIds =
      workspacesFromApprovedAccessDomain.map(({ workspace }) => workspace.id);

    const workspacesFromInvitations = (
      await this.workspaceInvitationService.findInvitationsByEmail(email)
    )
      .filter(
        ({ workspace }) =>
          ![
            ...alreadyMemberWorkspacesIds,
            ...workspacesFromApprovedAccessDomainIds,
          ].includes(workspace.id),
      )
      .map((appToken) => ({
        workspace: appToken.workspace,
        appToken,
      }));

    return {
      availableWorkspacesForSignIn: alreadyMemberWorkspaces,
      availableWorkspacesForSignUp: [
        ...workspacesFromApprovedAccessDomain,
        ...workspacesFromInvitations,
      ],
    };
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
      relations: ['twoFactorAuthenticationMethods'],
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

      try {
        const [_, subFolder, filename] =
          await this.fileService.copyFileFromWorkspaceToWorkspace(
            userWorkspace.workspaceId,
            userWorkspace.defaultAvatarUrl,
            workspaceId,
          );

        return `${subFolder}/${filename}`;
      } catch (error) {
        if (error.code === FileStorageExceptionCode.FILE_NOT_FOUND) {
          return;
        }
        throw error;
      }
    }

    if (!isDefined(pictureUrl) || pictureUrl === '') return;

    const { files } = await this.fileUploadService.uploadImageFromUrl({
      imageUrl: pictureUrl,
      fileFolder: FileFolder.ProfilePicture,
      workspaceId,
    });

    if (!files.length) {
      throw new Error('Failed to upload avatar');
    }

    return files[0].path;
  }

  castWorkspaceToAvailableWorkspace(workspace: Workspace) {
    return {
      id: workspace.id,
      displayName: workspace.displayName,
      workspaceUrls: this.domainManagerService.getWorkspaceUrls(workspace),
      logo: workspace.logo,
      sso:
        workspace.workspaceSSOIdentityProviders?.reduce(
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
          [] as AvailableWorkspace['sso'],
        ) ?? [],
    };
  }

  async setLoginTokenToAvailableWorkspacesWhenAuthProviderMatch(
    availableWorkspaces: {
      availableWorkspacesForSignUp: Array<{
        workspace: Workspace;
        appToken?: AppToken;
      }>;
      availableWorkspacesForSignIn: Array<{
        workspace: Workspace;
        appToken?: AppToken;
      }>;
    },
    user: User,
    authProvider: AuthProviderEnum,
  ) {
    return {
      availableWorkspacesForSignUp:
        availableWorkspaces.availableWorkspacesForSignUp.map(
          ({ workspace, appToken }) => {
            return {
              ...this.castWorkspaceToAvailableWorkspace(workspace),
              ...(appToken ? { personalInviteToken: appToken.value } : {}),
            };
          },
        ),
      availableWorkspacesForSignIn: await Promise.all(
        availableWorkspaces.availableWorkspacesForSignIn.map(
          async ({ workspace }) => {
            return {
              ...this.castWorkspaceToAvailableWorkspace(workspace),
              loginToken: workspaceValidator.isAuthEnabled(
                authProvider,
                workspace,
              )
                ? (
                    await this.loginTokenService.generateLoginToken(
                      user.email,
                      workspace.id,
                      AuthProviderEnum.Password,
                    )
                  ).token
                : undefined,
            };
          },
        ),
      ),
    };
  }
}
