import { InjectRepository } from '@nestjs/typeorm';

import assert from 'assert';

import { msg } from '@lingui/core/macro';
import { TypeOrmQueryService } from '@ptc-org/nestjs-query-typeorm';
import { SOURCE_LOCALE } from 'twenty-shared/translations';
import { assertIsDefinedOrThrow, isDefined } from 'twenty-shared/utils';
import { isWorkspaceActiveOrSuspended } from 'twenty-shared/workspace';
import { type QueryRunner, IsNull, Not, Repository } from 'typeorm';

import {
  AuthException,
  AuthExceptionCode,
} from 'src/engine/core-modules/auth/auth.exception';
import { WorkspaceDomainsService } from 'src/engine/core-modules/domain/workspace-domains/services/workspace-domains.service';
import { EmailVerificationTrigger } from 'src/engine/core-modules/email-verification/email-verification.constants';
import { EmailVerificationService } from 'src/engine/core-modules/email-verification/services/email-verification.service';
import { UserInputError } from 'src/engine/core-modules/graphql/utils/graphql-errors.util';
import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import { UserWorkspaceEntity } from 'src/engine/core-modules/user-workspace/user-workspace.entity';
import { UserWorkspaceService } from 'src/engine/core-modules/user-workspace/user-workspace.service';
import {
  UpdateWorkspaceMemberEmailJob,
  UpdateWorkspaceMemberEmailJobData,
} from 'src/engine/core-modules/user/jobs/update-workspace-member-email.job';
import { UserEntity } from 'src/engine/core-modules/user/user.entity';
import { UserExceptionCode } from 'src/engine/core-modules/user/user.exception';
import { userValidator } from 'src/engine/core-modules/user/user.validate';
import { WorkspaceService } from 'src/engine/core-modules/workspace/services/workspace.service';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import {
  PermissionsException,
  PermissionsExceptionCode,
  PermissionsExceptionMessage,
} from 'src/engine/metadata-modules/permissions/permissions.exception';
import { UserRoleService } from 'src/engine/metadata-modules/user-role/user-role.service';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { WorkspaceMemberWorkspaceEntity } from 'src/modules/workspace-member/standard-objects/workspace-member.workspace-entity';

// eslint-disable-next-line @nx/workspace-inject-workspace-repository
export class UserService extends TypeOrmQueryService<UserEntity> {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    private readonly workspaceDomainsService: WorkspaceDomainsService,
    private readonly emailVerificationService: EmailVerificationService,
    private readonly workspaceService: WorkspaceService,
    private readonly globalWorkspaceOrmManager: GlobalWorkspaceOrmManager,
    private readonly userRoleService: UserRoleService,
    private readonly userWorkspaceService: UserWorkspaceService,
    @InjectMessageQueue(MessageQueue.workspaceQueue)
    private readonly workspaceQueueService: MessageQueueService,
  ) {
    super(userRepository);
  }

  async loadWorkspaceMember(user: UserEntity, workspace: WorkspaceEntity) {
    if (!isWorkspaceActiveOrSuspended(workspace)) {
      return null;
    }

    const authContext = buildSystemAuthContext(workspace.id);

    return this.globalWorkspaceOrmManager.executeInWorkspaceContext(
      authContext,
      async () => {
        const workspaceMemberRepository =
          await this.globalWorkspaceOrmManager.getRepository<WorkspaceMemberWorkspaceEntity>(
            workspace.id,
            'workspaceMember',
            { shouldBypassPermissionChecks: true },
          );

        return await workspaceMemberRepository.findOne({
          where: {
            userId: user.id,
          },
        });
      },
    );
  }

  async loadWorkspaceMembers(workspace: WorkspaceEntity, withDeleted = false) {
    if (!isWorkspaceActiveOrSuspended(workspace)) {
      return [];
    }

    const authContext = buildSystemAuthContext(workspace.id);

    return this.globalWorkspaceOrmManager.executeInWorkspaceContext(
      authContext,
      async () => {
        const workspaceMemberRepository =
          await this.globalWorkspaceOrmManager.getRepository<WorkspaceMemberWorkspaceEntity>(
            workspace.id,
            'workspaceMember',
            { shouldBypassPermissionChecks: true },
          );

        return await workspaceMemberRepository.find({
          withDeleted: withDeleted,
        });
      },
    );
  }

  async loadDeletedWorkspaceMembersOnly(workspace: WorkspaceEntity) {
    if (!isWorkspaceActiveOrSuspended(workspace)) {
      return [];
    }

    const authContext = buildSystemAuthContext(workspace.id);

    return this.globalWorkspaceOrmManager.executeInWorkspaceContext(
      authContext,
      async () => {
        const workspaceMemberRepository =
          await this.globalWorkspaceOrmManager.getRepository<WorkspaceMemberWorkspaceEntity>(
            workspace.id,
            'workspaceMember',
            { shouldBypassPermissionChecks: true },
          );

        return await workspaceMemberRepository.find({
          where: { deletedAt: Not(IsNull()) },
          withDeleted: true,
        });
      },
    );
  }

  async deleteUser(userId: string) {
    const user = await this.userRepository.findOne({
      where: {
        id: userId,
      },
      relations: { userWorkspaces: true },
    });

    userValidator.assertIsDefinedOrThrow(user);

    for (const userWorkspace of user.userWorkspaces) {
      await this.removeUserFromWorkspaceAndPotentiallyDeleteWorkspace(
        userWorkspace,
      );
    }

    await this.userRepository.softDelete({ id: userId });

    return await this.userRepository.findOne({
      where: {
        id: userId,
      },
      withDeleted: true,
    });
  }

  async deleteUserWorkspaceAndPotentiallyDeleteUser({
    userId,
    workspaceId,
  }: {
    userId: string;
    workspaceId: string;
  }) {
    const user = await this.userRepository.findOne({
      where: {
        id: userId,
      },
      relations: { userWorkspaces: true },
    });

    userValidator.assertIsDefinedOrThrow(user);

    const userWorkspace = user.userWorkspaces.find(
      (userWorkspace) => userWorkspace.workspaceId === workspaceId,
    );

    if (!isDefined(userWorkspace)) {
      throw new Error('User workspace not found.');
    }

    await this.removeUserFromWorkspaceAndPotentiallyDeleteWorkspace(
      userWorkspace,
    );

    if (user.userWorkspaces.length === 1) {
      await this.userRepository.softDelete(userId);
    }

    return userWorkspace;
  }

  async removeUserFromWorkspaceAndPotentiallyDeleteWorkspace(
    userWorkspace: UserWorkspaceEntity,
  ) {
    const workspaceId = userWorkspace.workspaceId;
    const authContext = buildSystemAuthContext(workspaceId);

    const workspaceMembers =
      await this.globalWorkspaceOrmManager.executeInWorkspaceContext(
        authContext,
        async () => {
          const workspaceMemberRepository =
            await this.globalWorkspaceOrmManager.getRepository<WorkspaceMemberWorkspaceEntity>(
              workspaceId,
              'workspaceMember',
              { shouldBypassPermissionChecks: true },
            );

          return workspaceMemberRepository.find();
        },
      );

    const userWorkspaceId = userWorkspace.id;

    if (workspaceMembers.length === 1) {
      await this.workspaceService.deleteWorkspace(workspaceId);

      return;
    }

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
      (member: WorkspaceMemberWorkspaceEntity) =>
        member.userId === userWorkspace.userId,
    );

    assert(workspaceMember, 'WorkspaceMember not found');

    await this.globalWorkspaceOrmManager.executeInWorkspaceContext(
      authContext,
      async () => {
        const workspaceMemberRepository =
          await this.globalWorkspaceOrmManager.getRepository<WorkspaceMemberWorkspaceEntity>(
            workspaceId,
            'workspaceMember',
            { shouldBypassPermissionChecks: true },
          );

        await workspaceMemberRepository.delete({
          userId: userWorkspace.userId,
        });
      },
    );

    await this.userWorkspaceService.deleteUserWorkspace({
      userWorkspaceId,
    });
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

  async markEmailAsVerified(userId: string, queryRunner?: QueryRunner) {
    const user = await this.findUserByIdOrThrow(userId);

    user.isEmailVerified = true;

    return queryRunner
      ? await queryRunner.manager.save(UserEntity, user)
      : await this.userRepository.save(user);
  }

  async updateEmailFromVerificationToken(userId: string, email: string) {
    const user = await this.findUserByIdOrThrow(userId);

    user.email = email;

    const updatedUser = await this.userRepository.save(user);

    await this.enqueueWorkspaceMemberEmailUpdate({
      userId: user.id,
      email,
    });

    return updatedUser;
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
      throw new UserInputError(
        'New email must be different from current email',
        {
          subCode: UserExceptionCode.EMAIL_UNCHANGED,
          userFriendlyMessage: msg`New email must be different from current email`,
        },
      );
    }

    const userWorkspaceCount =
      await this.userWorkspaceService.countUserWorkspaces(user.id);

    if (userWorkspaceCount > 1) {
      throw new UserInputError(
        'Email updates are available only for users with a single workspace',
        {
          subCode:
            UserExceptionCode.EMAIL_UPDATE_RESTRICTED_TO_SINGLE_WORKSPACE,
          userFriendlyMessage: msg`Email can only be updated when you belong to a single workspace.`,
        },
      );
    }

    const existingUser = await this.userRepository.findOne({
      where: { email: normalizedEmail },
    });

    if (existingUser && existingUser.id !== user.id) {
      throw new UserInputError('Email already in use', {
        subCode: UserExceptionCode.EMAIL_ALREADY_IN_USE,
        userFriendlyMessage: msg`Email already in use`,
      });
    }

    const workspaceDomainConfig =
      this.workspaceDomainsService.getSubdomainAndCustomDomainFromWorkspaceFallbackOnDefaultSubdomain(
        workspace,
      );

    await this.emailVerificationService.sendVerificationEmail({
      userId: user.id,
      email: normalizedEmail,
      workspace: workspaceDomainConfig,
      locale: user.locale || SOURCE_LOCALE,
      verifyEmailRedirectPath,
      verificationTrigger: EmailVerificationTrigger.EMAIL_UPDATE,
    });
  }

  async enqueueWorkspaceMemberEmailUpdate(
    data: UpdateWorkspaceMemberEmailJobData,
  ) {
    await this.workspaceQueueService.add<UpdateWorkspaceMemberEmailJobData>(
      UpdateWorkspaceMemberEmailJob.name,
      data,
      {
        retryLimit: 2,
      },
    );
  }
}
