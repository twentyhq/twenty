import { InjectRepository } from '@nestjs/typeorm';

import assert from 'assert';

import { msg } from '@lingui/core/macro';
import { TypeOrmQueryService } from '@ptc-org/nestjs-query-typeorm';
import { SOURCE_LOCALE } from 'twenty-shared/translations';
import { assertIsDefinedOrThrow } from 'twenty-shared/utils';
import { isWorkspaceActiveOrSuspended } from 'twenty-shared/workspace';
import { In, IsNull, Not, Repository } from 'typeorm';

import {
  AuthException,
  AuthExceptionCode,
} from 'src/engine/core-modules/auth/auth.exception';
import { WorkspaceDomainsService } from 'src/engine/core-modules/domain/workspace-domains/services/workspace-domains.service';
import { EmailVerificationService } from 'src/engine/core-modules/email-verification/services/email-verification.service';
import { UserWorkspaceService } from 'src/engine/core-modules/user-workspace/user-workspace.service';
import { UserEntity } from 'src/engine/core-modules/user/user.entity';
import {
  UserException,
  UserExceptionCode,
} from 'src/engine/core-modules/user/user.exception';
import { userValidator } from 'src/engine/core-modules/user/user.validate';
import { WorkspaceService } from 'src/engine/core-modules/workspace/services/workspace.service';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { DataSourceService } from 'src/engine/metadata-modules/data-source/data-source.service';
import {
  PermissionsException,
  PermissionsExceptionCode,
  PermissionsExceptionMessage,
} from 'src/engine/metadata-modules/permissions/permissions.exception';
import { UserRoleService } from 'src/engine/metadata-modules/user-role/user-role.service';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';
import { WorkspaceMemberWorkspaceEntity } from 'src/modules/workspace-member/standard-objects/workspace-member.workspace-entity';

// eslint-disable-next-line @nx/workspace-inject-workspace-repository
export class UserService extends TypeOrmQueryService<UserEntity> {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    private readonly workspaceDomainsService: WorkspaceDomainsService,
    private readonly emailVerificationService: EmailVerificationService,
    private readonly workspaceService: WorkspaceService,
    private readonly twentyORMGlobalManager: TwentyORMGlobalManager,
    private readonly userRoleService: UserRoleService,
    private readonly userWorkspaceService: UserWorkspaceService,
    private readonly dataSourceService: DataSourceService,
  ) {
    super(userRepository);
  }

  async loadWorkspaceMember(user: UserEntity, workspace: WorkspaceEntity) {
    if (!isWorkspaceActiveOrSuspended(workspace)) {
      return null;
    }

    const workspaceMemberRepository =
      await this.twentyORMGlobalManager.getRepositoryForWorkspace<WorkspaceMemberWorkspaceEntity>(
        workspace.id,
        'workspaceMember',
        { shouldBypassPermissionChecks: true },
      );

    return await workspaceMemberRepository.findOne({
      where: {
        userId: user.id,
      },
    });
  }

  async loadWorkspaceMembers(workspace: WorkspaceEntity, withDeleted = false) {
    if (!isWorkspaceActiveOrSuspended(workspace)) {
      return [];
    }

    const workspaceMemberRepository =
      await this.twentyORMGlobalManager.getRepositoryForWorkspace<WorkspaceMemberWorkspaceEntity>(
        workspace.id,
        'workspaceMember',
        { shouldBypassPermissionChecks: true },
      );

    return await workspaceMemberRepository.find({ withDeleted: withDeleted });
  }

  async loadDeletedWorkspaceMembersOnly(workspace: WorkspaceEntity) {
    if (!isWorkspaceActiveOrSuspended(workspace)) {
      return [];
    }

    const workspaceMemberRepository =
      await this.twentyORMGlobalManager.getRepositoryForWorkspace<WorkspaceMemberWorkspaceEntity>(
        workspace.id,
        'workspaceMember',
        { shouldBypassPermissionChecks: true },
      );

    return await workspaceMemberRepository.find({
      where: { deletedAt: Not(IsNull()) },
      withDeleted: true,
    });
  }

  async deleteUser(userId: string): Promise<UserEntity> {
    const user = await this.userRepository.findOne({
      where: {
        id: userId,
      },
      relations: { userWorkspaces: true },
    });

    userValidator.assertIsDefinedOrThrow(user);

    const prepareForUserDeletionInWorkspaces = await Promise.all(
      user.userWorkspaces.map(async (userWorkspace) => {
        const { workspaceId } = userWorkspace;

        const workspaceMemberRepository =
          await this.twentyORMGlobalManager.getRepositoryForWorkspace<WorkspaceMemberWorkspaceEntity>(
            workspaceId,
            'workspaceMember',
            { shouldBypassPermissionChecks: true },
          );

        const workspaceMembers = await workspaceMemberRepository.find();

        if (workspaceMembers.length > 1) {
          try {
            await this.userRoleService.validateUserWorkspaceIsNotUniqueAdminOrThrow(
              {
                workspaceId,
                userWorkspaceId: userWorkspace.id,
              },
            );
          } catch (error) {
            if (
              error instanceof PermissionsException &&
              error.code === PermissionsExceptionCode.CANNOT_UNASSIGN_LAST_ADMIN
            ) {
              throw new PermissionsException(
                PermissionsExceptionMessage.CANNOT_DELETE_LAST_ADMIN_USER,
                PermissionsExceptionCode.CANNOT_DELETE_LAST_ADMIN_USER,
                {
                  userFriendlyMessage: msg`Cannot delete account: you are the only admin. Assign another admin or delete the workspace(s) first.`,
                },
              );
            }
            throw error;
          }
        }

        const workspaceMember = workspaceMembers.find(
          (member: WorkspaceMemberWorkspaceEntity) => member.userId === userId,
        );

        assert(workspaceMember, 'WorkspaceMember not found');

        return {
          workspaceId,
          workspaceMemberRepository,
          workspaceMembers,
          workspaceMember,
        };
      }),
    );

    await Promise.all(
      prepareForUserDeletionInWorkspaces.map(
        async ({
          workspaceId,
          workspaceMemberRepository,
          workspaceMembers,
        }) => {
          await workspaceMemberRepository.delete({ userId });

          if (workspaceMembers.length === 1) {
            await this.workspaceService.deleteWorkspace(workspaceId);

            return;
          }
        },
      ),
    );

    return user;
  }

  async hasUserAccessToWorkspaceOrThrow(userId: string, workspaceId: string) {
    const user = await this.userRepository.findOne({
      where: {
        id: userId,
        userWorkspaces: {
          workspaceId,
        },
      },
      relations: { userWorkspaces: true },
    });

    userValidator.assertIsDefinedOrThrow(
      user,
      new AuthException(
        'User does not have access to this workspace',
        AuthExceptionCode.FORBIDDEN_EXCEPTION,
      ),
    );
  }

  async findUserByEmailOrThrow(email: string, error?: Error) {
    const user = await this.findUserByEmail(email);

    assertIsDefinedOrThrow(user, error);

    return user;
  }

  async findUserByEmail(email: string) {
    return await this.userRepository.findOne({
      where: {
        email,
      },
    });
  }

  async findUserByEmailWithWorkspaces(email: string) {
    return await this.userRepository.findOne({
      where: {
        email,
      },
      relations: { userWorkspaces: true },
    });
  }

  async findUserById(id: string) {
    return await this.userRepository.findOne({
      where: {
        id,
      },
    });
  }

  async findUserByIdOrThrow(id: string, error?: Error) {
    const user = await this.findUserById(id);

    assertIsDefinedOrThrow(user, error);

    return user;
  }

  async markEmailAsVerified(userId: string) {
    const user = await this.findUserByIdOrThrow(userId);

    user.isEmailVerified = true;

    return await this.userRepository.save(user);
  }

  async updateUserEmail({
    user,
    workspace,
    newEmail,
    verifyEmailRedirectPath,
  }: {
    user: UserEntity;
    workspace: WorkspaceEntity;
    newEmail: string;
    verifyEmailRedirectPath?: string;
  }): Promise<void> {
    const normalizedEmail = newEmail.trim().toLowerCase();

    if (normalizedEmail === user.email) {
      throw new UserException(
        'New email must be different from current email',
        UserExceptionCode.EMAIL_ALREADY_IN_USE,
      );
    }

    const existingUser = await this.userRepository.findOne({
      where: { email: normalizedEmail },
    });

    if (existingUser && existingUser.id !== user.id) {
      throw new UserException(
        'Email already in use',
        UserExceptionCode.EMAIL_ALREADY_IN_USE,
      );
    }

    user.email = normalizedEmail;
    user.isEmailVerified = false;

    await this.userRepository.save(user);

    const userWorkspaceIds =
      await this.userWorkspaceService.findWorkspaceIdsByUserId(user.id);

    const dataSources = await this.dataSourceService.getManyDataSourceMetadata({
      where: {
        workspaceId: In(userWorkspaceIds),
      },
      order: { createdAt: 'DESC' },
    });

    for (const dataSource of dataSources) {
      const workspaceId = dataSource.workspaceId;

      const workspaceMemberRepository =
        await this.twentyORMGlobalManager.getRepositoryForWorkspace<WorkspaceMemberWorkspaceEntity>(
          workspaceId,
          'workspaceMember',
          { shouldBypassPermissionChecks: true },
        );

      await workspaceMemberRepository.update(
        { userId: user.id },
        { userEmail: user.email },
      );
    }

    const workspaceDomainConfig =
      this.workspaceDomainsService.getSubdomainAndCustomDomainFromWorkspaceFallbackOnDefaultSubdomain(
        workspace,
      );

    await this.emailVerificationService.sendVerificationEmail(
      user.id,
      normalizedEmail,
      workspaceDomainConfig,
      user.locale || SOURCE_LOCALE,
      verifyEmailRedirectPath,
    );
  }
}
