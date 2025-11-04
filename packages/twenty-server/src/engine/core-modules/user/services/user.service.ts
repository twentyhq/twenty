import { InjectRepository } from '@nestjs/typeorm';

import assert from 'assert';

import { msg } from '@lingui/core/macro';
import { TypeOrmQueryService } from '@ptc-org/nestjs-query-typeorm';
import { assertIsDefinedOrThrow } from 'twenty-shared/utils';
import { isWorkspaceActiveOrSuspended } from 'twenty-shared/workspace';
import { IsNull, Not, Repository } from 'typeorm';

import {
  AuthException,
  AuthExceptionCode,
} from 'src/engine/core-modules/auth/auth.exception';
import { UserEntity } from 'src/engine/core-modules/user/user.entity';
import { userValidator } from 'src/engine/core-modules/user/user.validate';
import { WorkspaceService } from 'src/engine/core-modules/workspace/services/workspace.service';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
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
    private readonly workspaceService: WorkspaceService,
    private readonly twentyORMGlobalManager: TwentyORMGlobalManager,
    private readonly userRoleService: UserRoleService,
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
}
