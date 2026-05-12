import { Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { TypeOrmQueryService } from '@ptc-org/nestjs-query-typeorm';
import { type APP_LOCALES, SOURCE_LOCALE } from 'twenty-shared/translations';
import { FileFolder } from 'twenty-shared/types';
import { assertIsDefinedOrThrow, isDefined } from 'twenty-shared/utils';
import { IsNull, Not, type QueryRunner, type Repository } from 'typeorm';

import { CoreEntityCacheService } from 'src/engine/core-entity-cache/services/core-entity-cache.service';
import { FileStorageExceptionCode } from 'src/engine/core-modules/file-storage/interfaces/file-storage-exception';

import { type AppTokenEntity } from 'src/engine/core-modules/app-token/app-token.entity';
import { ApprovedAccessDomainService } from 'src/engine/core-modules/approved-access-domain/services/approved-access-domain.service';
import {
  AuthException,
  AuthExceptionCode,
} from 'src/engine/core-modules/auth/auth.exception';
import { type AvailableWorkspace } from 'src/engine/core-modules/auth/dto/available-workspaces.dto';
import { LoginTokenService } from 'src/engine/core-modules/auth/token/services/login-token.service';
import { WorkspaceDomainsService } from 'src/engine/core-modules/domain/workspace-domains/services/workspace-domains.service';
import { FileCorePictureService } from 'src/engine/core-modules/file/file-core-picture/services/file-core-picture.service';
import { FileUrlService } from 'src/engine/core-modules/file/file-url/file-url.service';
import { extractFileIdFromUrl } from 'src/engine/core-modules/file/files-field/utils/extract-file-id-from-url.util';
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
import { RoleValidationService } from 'src/engine/metadata-modules/role-validation/services/role-validation.service';
import { UserRoleService } from 'src/engine/metadata-modules/user-role/user-role.service';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { type WorkspaceMemberWorkspaceEntity } from 'src/modules/workspace-member/standard-objects/workspace-member.workspace-entity';
import { assert } from 'src/utils/assert';
import { getDomainNameByEmail } from 'src/utils/get-domain-name-by-email';

export class UserWorkspaceService extends TypeOrmQueryService<UserWorkspaceEntity> {
  private readonly logger = new Logger(UserWorkspaceService.name);

  constructor(
    @InjectRepository(UserWorkspaceEntity)
    private readonly userWorkspaceRepository: Repository<UserWorkspaceEntity>,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    @InjectRepository(RoleTargetEntity)
    private readonly roleTargetRepository: Repository<RoleTargetEntity>,
    private readonly roleValidationService: RoleValidationService,
    private readonly workspaceInvitationService: WorkspaceInvitationService,
    private readonly workspaceDomainsService: WorkspaceDomainsService,
    private readonly loginTokenService: LoginTokenService,
    private readonly approvedAccessDomainService: ApprovedAccessDomainService,
    private readonly globalWorkspaceOrmManager: GlobalWorkspaceOrmManager,
    private readonly userRoleService: UserRoleService,
    private readonly fileCorePictureService: FileCorePictureService,
    private readonly fileUrlService: FileUrlService,
    private readonly onboardingService: OnboardingService,
    private readonly coreEntityCacheService: CoreEntityCacheService,
  ) {
    super(userWorkspaceRepository);
  }

  async updateUserWorkspaceLocaleForUserWorkspace({
    locale,
    userWorkspaceId,
  }: {
    locale: UserWorkspaceEntity['locale'];
    userWorkspaceId: string;
  }): Promise<void> {
    const userWorkspace = await this.userWorkspaceRepository.findOne({
      where: {
        id: userWorkspaceId,
      },
    });

    if (!isDefined(userWorkspace)) {
      return;
    }

    userWorkspace.locale = locale;
    await this.userWorkspaceRepository.save(userWorkspace);

    await this.coreEntityCacheService.invalidate(
      'userWorkspaceEntity',
      userWorkspaceId,
    );
  }

  async create(
    {
      userId,
      workspaceId,
      isExistingUser,
      pictureUrl,
      applicationUniversalIdentifier,
    }: {
      userId: string;
      workspaceId: string;
      isExistingUser: boolean;
      pictureUrl?: string;
      applicationUniversalIdentifier?: string;
    },
    queryRunner?: QueryRunner,
  ): Promise<UserWorkspaceEntity> {
    const defaultAvatarUrl = await this.computeDefaultAvatarUrl(
      userId,
      workspaceId,
      isExistingUser,
      pictureUrl,
      applicationUniversalIdentifier,
      queryRunner,
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

  async createWorkspaceMember(
    workspaceId: string,
    user: Pick<
      UserEntity,
      'id' | 'firstName' | 'lastName' | 'email' | 'locale'
    >,
  ) {
    const authContext = buildSystemAuthContext(workspaceId);

    await this.globalWorkspaceOrmManager.executeInWorkspaceContext(async () => {
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
        avatarUrl: userWorkspace.defaultAvatarUrl ?? null,
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
    }, authContext);
  }

  async addUserToWorkspaceIfUserNotInWorkspace(
    user: UserEntity,
    workspace: WorkspaceEntity,
    roleId?: string | null,
  ) {
    const existingUserWorkspace = await this.checkUserWorkspaceExists(
      user.id,
      workspace.id,
    );

    if (existingUserWorkspace) {
      return;
    }

    const resolvedRoleId = await this.resolveRoleIdForNewMember(
      roleId,
      workspace,
    );

    const userWorkspace = await this.create({
      userId: user.id,
      workspaceId: workspace.id,
      isExistingUser: true,
    });

    await this.createWorkspaceMember(workspace.id, user);

    await this.userRoleService.assignRoleToManyUserWorkspace({
      workspaceId: workspace.id,
      userWorkspaceIds: [userWorkspace.id],
      roleId: resolvedRoleId,
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

  private async resolveRoleIdForNewMember(
    roleId: string | null | undefined,
    workspace: WorkspaceEntity,
  ): Promise<string> {
    if (isDefined(roleId)) {
      await this.roleValidationService.validateRoleAssignableToUsersOrThrow(
        roleId,
        workspace.id,
      );

      return roleId;
    }

    const defaultRoleId = workspace.defaultRoleId;

    if (!isDefined(defaultRoleId)) {
      throw new PermissionsException(
        PermissionsExceptionMessage.DEFAULT_ROLE_NOT_FOUND,
        PermissionsExceptionCode.DEFAULT_ROLE_NOT_FOUND,
      );
    }

    return defaultRoleId;
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
      authContext,
    );
  }

  private async computeDefaultAvatarUrl(
    userId: string,
    workspaceId: string,
    isExistingUser: boolean,
    pictureUrl?: string,
    applicationUniversalIdentifier?: string,
    queryRunner?: QueryRunner,
  ) {
    return this.computeDefaultAvatarUrlMigrated(
      userId,
      workspaceId,
      isExistingUser,
      pictureUrl,
      applicationUniversalIdentifier,
      queryRunner,
    );
  }

  private async computeDefaultAvatarUrlMigrated(
    userId: string,
    workspaceId: string,
    isExistingUser: boolean,
    pictureUrl?: string,
    applicationUniversalIdentifier?: string,
    queryRunner?: QueryRunner,
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

      const sourceFileId = extractFileIdFromUrl(
        userWorkspace.defaultAvatarUrl,
        FileFolder.CorePicture,
      );

      if (!isDefined(sourceFileId)) return;

      try {
        const savedFile =
          await this.fileCorePictureService.copyWorkspaceMemberProfilePicture({
            sourceWorkspaceId: userWorkspace.workspaceId,
            sourceFileId,
            targetWorkspaceId: workspaceId,
            targetApplicationUniversalIdentifier:
              applicationUniversalIdentifier,
            queryRunner,
          });

        return this.fileUrlService.getLegacyWorkspaceMemberAvatarUrl({
          fileId: savedFile.id,
          fileFolder: FileFolder.CorePicture,
        });
      } catch (error) {
        if (error.code === FileStorageExceptionCode.FILE_NOT_FOUND) {
          return;
        }
        throw error;
      }
    }

    if (!isDefined(pictureUrl) || pictureUrl === '') return;

    const savedFile =
      await this.fileCorePictureService.uploadWorkspaceMemberProfilePictureFromUrl(
        {
          imageUrl: pictureUrl,
          workspaceId,
          applicationUniversalIdentifier,
          queryRunner,
        },
      );

    if (!isDefined(savedFile)) {
      return;
    }

    return this.fileUrlService.getLegacyWorkspaceMemberAvatarUrl({
      fileId: savedFile.id,
      fileFolder: FileFolder.CorePicture,
    });
  }

  castWorkspaceToAvailableWorkspace(workspace: WorkspaceEntity) {
    return {
      id: workspace.id,
      displayName: workspace.displayName,
      workspaceUrls: this.workspaceDomainsService.getWorkspaceUrls(workspace),
      logo: isDefined(workspace.logoFileId)
        ? this.fileUrlService.signFileByIdUrl({
            fileId: workspace.logoFileId,
            workspaceId: workspace.id,
            fileFolder: FileFolder.CorePicture,
          })
        : '',
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
    user: Pick<UserEntity, 'email'>,
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

  public async getActiveUserWorkspaceCountTotal(): Promise<number> {
    const count = await this.userWorkspaceRepository.count({
      where: { deletedAt: IsNull() },
    });

    return Math.max(1, count);
  }
}
