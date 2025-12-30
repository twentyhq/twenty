import { InjectRepository } from '@nestjs/typeorm';

import { TypeOrmQueryService } from '@ptc-org/nestjs-query-typeorm';
import { type APP_LOCALES, SOURCE_LOCALE } from 'twenty-shared/translations';
import { assertIsDefinedOrThrow, isDefined } from 'twenty-shared/utils';
import { type QueryRunner, IsNull, Not, type Repository } from 'typeorm';

import { FileStorageExceptionCode } from 'src/engine/core-modules/file-storage/interfaces/file-storage-exception';
import { FileFolder } from 'src/engine/core-modules/file/interfaces/file-folder.interface';

import { type AppTokenEntity } from 'src/engine/core-modules/app-token/app-token.entity';
import { ApprovedAccessDomainService } from 'src/engine/core-modules/approved-access-domain/services/approved-access-domain.service';
import {
  AuthException,
  AuthExceptionCode,
} from 'src/engine/core-modules/auth/auth.exception';
import { type AvailableWorkspace } from 'src/engine/core-modules/auth/dto/available-workspaces.output';
import { LoginTokenService } from 'src/engine/core-modules/auth/token/services/login-token.service';
import { WorkspaceDomainsService } from 'src/engine/core-modules/domain/workspace-domains/services/workspace-domains.service';
import { FileUploadService } from 'src/engine/core-modules/file/file-upload/services/file-upload.service';
import { FileService } from 'src/engine/core-modules/file/services/file.service';
import { OnboardingService } from 'src/engine/core-modules/onboarding/onboarding.service';
import { UserWorkspaceEntity } from 'src/engine/core-modules/user-workspace/user-workspace.entity';
import { UserEntity } from 'src/engine/core-modules/user/user.entity';
import { WorkspaceInvitationService } from 'src/engine/core-modules/workspace-invitation/services/workspace-invitation.service';
import { AuthProviderEnum } from 'src/engine/core-modules/workspace/types/workspace.type';
import { type WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { workspaceValidator } from 'src/engine/core-modules/workspace/workspace.validate';
import {
  PermissionsException,
  PermissionsExceptionCode,
  PermissionsExceptionMessage,
} from 'src/engine/metadata-modules/permissions/permissions.exception';
import { RoleTargetEntity } from 'src/engine/metadata-modules/role-target/role-target.entity';
import { UserRoleService } from 'src/engine/metadata-modules/user-role/user-role.service';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { type WorkspaceMemberWorkspaceEntity } from 'src/modules/workspace-member/standard-objects/workspace-member.workspace-entity';
import { assert } from 'src/utils/assert';
import { getDomainNameByEmail } from 'src/utils/get-domain-name-by-email';

export class UserWorkspaceService extends TypeOrmQueryService<UserWorkspaceEntity> {
  constructor(
    @InjectRepository(UserWorkspaceEntity)
    private readonly userWorkspaceRepository: Repository<UserWorkspaceEntity>,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    @InjectRepository(RoleTargetEntity)
    private readonly roleTargetRepository: Repository<RoleTargetEntity>,
    private readonly workspaceInvitationService: WorkspaceInvitationService,
    private readonly workspaceDomainsService: WorkspaceDomainsService,
    private readonly loginTokenService: LoginTokenService,
    private readonly approvedAccessDomainService: ApprovedAccessDomainService,
    private readonly globalWorkspaceOrmManager: GlobalWorkspaceOrmManager,
    private readonly userRoleService: UserRoleService,
    private readonly fileUploadService: FileUploadService,
    private readonly fileService: FileService,
    private readonly onboardingService: OnboardingService,
  ) {
    super(userWorkspaceRepository);
  }

  async create(
    {
      userId,
      workspaceId,
      isExistingUser,
      pictureUrl,
    }: {
      userId: string;
      workspaceId: string;
      isExistingUser: boolean;
      pictureUrl?: string;
    },
    queryRunner?: QueryRunner,
  ): Promise<UserWorkspaceEntity> {
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

    return queryRunner
      ? queryRunner.manager.save(UserWorkspaceEntity, userWorkspace)
      : this.userWorkspaceRepository.save(userWorkspace);
  }

  async createWorkspaceMember(workspaceId: string, user: UserEntity) {
    const authContext = buildSystemAuthContext(workspaceId);

    await this.globalWorkspaceOrmManager.executeInWorkspaceContext(
      authContext,
      async () => {
        const workspaceMemberRepository =
          await this.globalWorkspaceOrmManager.getRepository<WorkspaceMemberWorkspaceEntity>(
            workspaceId,
            'workspaceMember',
            { shouldBypassPermissionChecks: true },
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
      },
    );
  }

  async addUserToWorkspaceIfUserNotInWorkspace(
    user: UserEntity,
    workspace: WorkspaceEntity,
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

      await this.userRoleService.assignRoleToManyUserWorkspace({
        workspaceId: workspace.id,
        userWorkspaceIds: [userWorkspace.id],
        roleId: defaultRoleId,
      });

      await this.workspaceInvitationService.invalidateWorkspaceInvitation(
        workspace.id,
        user.email,
      );

      await this.onboardingService.setOnboardingCreateProfilePending({
        userId: user.id,
        workspaceId: workspace.id,
        value: true,
      });
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
  ): Promise<UserWorkspaceEntity | null> {
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

    assertIsDefinedOrThrow(
      workspace,
      new AuthException(
        'Workspace not found',
        AuthExceptionCode.WORKSPACE_NOT_FOUND,
      ),
    );

    return workspace;
  }

  async countUserWorkspaces(userId: string): Promise<number> {
    return await this.userWorkspaceRepository.count({ where: { userId } });
  }

  async deleteUserWorkspace({
    userWorkspaceId,
    softDelete = false,
  }: {
    userWorkspaceId: string;
    softDelete?: boolean;
  }): Promise<void> {
    if (softDelete) {
      await this.roleTargetRepository.softRemove({ userWorkspaceId });
      await this.userWorkspaceRepository.softDelete({ id: userWorkspaceId });
    } else {
      await this.roleTargetRepository.delete({ userWorkspaceId }); // TODO remove once userWorkspace foreign key is added on roleTarget
      await this.userWorkspaceRepository.delete({ id: userWorkspaceId });
    }
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
    relations = ['twoFactorAuthenticationMethods'],
  }: {
    userId: string;
    workspaceId: string;
    relations?: string[];
  }): Promise<UserWorkspaceEntity> {
    const userWorkspace = await this.userWorkspaceRepository.findOne({
      where: {
        userId,
        workspaceId,
      },
      relations,
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
    const authContext = buildSystemAuthContext(workspaceId);

    return this.globalWorkspaceOrmManager.executeInWorkspaceContext(
      authContext,
      async () => {
        const workspaceMemberRepository =
          await this.globalWorkspaceOrmManager.getRepository<WorkspaceMemberWorkspaceEntity>(
            workspaceId,
            'workspaceMember',
            { shouldBypassPermissionChecks: true },
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
      },
    );
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

  castWorkspaceToAvailableWorkspace(workspace: WorkspaceEntity) {
    return {
      id: workspace.id,
      displayName: workspace.displayName,
      workspaceUrls: this.workspaceDomainsService.getWorkspaceUrls(workspace),
      logo: workspace.logo
        ? this.fileService.signFileUrl({
            url: workspace.logo,
            workspaceId: workspace.id,
          })
        : workspace.logo,
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
        workspace: WorkspaceEntity;
        appToken?: AppTokenEntity;
      }>;
      availableWorkspacesForSignIn: Array<{
        workspace: WorkspaceEntity;
        appToken?: AppTokenEntity;
      }>;
    },
    user: UserEntity,
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
