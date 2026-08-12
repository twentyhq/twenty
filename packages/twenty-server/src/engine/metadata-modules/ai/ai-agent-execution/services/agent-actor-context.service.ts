import { Injectable } from '@nestjs/common';

import { type ActorMetadata, FieldActorSource } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { buildCreatedByFromFullNameMetadata } from 'src/engine/core-modules/actor/utils/build-created-by-from-full-name-metadata.util';
import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { buildUserAuthContext } from 'src/engine/core-modules/auth/utils/build-user-auth-context.util';
import { fromUserEntityToFlat } from 'src/engine/core-modules/user/utils/from-user-entity-to-flat.util';
import { UserWorkspaceService } from 'src/engine/core-modules/user-workspace/user-workspace.service';
import { fromWorkspaceEntityToFlat } from 'src/engine/core-modules/workspace/utils/from-workspace-entity-to-flat.util';
import {
  AiException,
  AiExceptionCode,
} from 'src/engine/metadata-modules/ai/ai.exception';
import { type RunAsWorkspaceMemberContext } from 'src/engine/metadata-modules/ai/ai-agent-execution/types/run-as-workspace-member-context.type';
import {
  PermissionsException,
  PermissionsExceptionCode,
} from 'src/engine/metadata-modules/permissions/permissions.exception';
import { UserRoleService } from 'src/engine/metadata-modules/user-role/user-role.service';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';

export type UserContext = {
  firstName: string;
  lastName: string;
  jobTitle: string | null;
  locale: string;
  timezone: string | null;
};

export type AgentActorContext = {
  actorContext: ActorMetadata;
  roleId: string;
  userId: string;
  userWorkspaceId: string;
  userContext: UserContext;
};

@Injectable()
// oxlint-disable-next-line twenty/inject-workspace-repository
export class AgentActorContextService {
  constructor(
    private readonly userWorkspaceService: UserWorkspaceService,
    private readonly userRoleService: UserRoleService,
    private readonly globalWorkspaceOrmManager: GlobalWorkspaceOrmManager,
  ) {}

  async buildUserAndAgentActorContext(
    userWorkspaceId: string,
    workspaceId: string,
  ): Promise<AgentActorContext> {
    const authContext = buildSystemAuthContext(workspaceId);

    const userWorkspace =
      await this.userWorkspaceService.findById(userWorkspaceId);

    if (!userWorkspace) {
      throw new AiException(
        'User workspace not found',
        AiExceptionCode.AGENT_EXECUTION_FAILED,
      );
    }

    const workspaceMember =
      await this.globalWorkspaceOrmManager.executeInWorkspaceContext(
        async () => {
          const workspaceMemberRepository =
            await this.globalWorkspaceOrmManager.getRepository(
              workspaceId,
              'workspaceMember',
              { shouldBypassPermissionChecks: true },
            );

          return workspaceMemberRepository.findOne({
            where: {
              userId: userWorkspace.userId,
            },
          });
        },
        authContext,
      );

    if (!workspaceMember) {
      throw new AiException(
        'Workspace member not found for user',
        AiExceptionCode.AGENT_EXECUTION_FAILED,
      );
    }

    const roleId = await this.userRoleService.getRoleIdForUserWorkspace({
      userWorkspaceId,
      workspaceId,
    });

    if (!roleId) {
      throw new AiException(
        'User role not found',
        AiExceptionCode.AGENT_EXECUTION_FAILED,
      );
    }

    const actorContext = buildCreatedByFromFullNameMetadata({
      fullNameMetadata: workspaceMember.name,
      workspaceMemberId: workspaceMember.id,
      source: FieldActorSource.AGENT,
    });

    const userContext: UserContext = {
      firstName: workspaceMember.name?.firstName ?? '',
      lastName: workspaceMember.name?.lastName ?? '',
      jobTitle: workspaceMember.jobTitle,
      locale: userWorkspace.locale,
      timezone: workspaceMember.timeZone ?? null,
    };

    return {
      actorContext,
      roleId,
      userId: userWorkspace.userId,
      userWorkspaceId,
      userContext,
    };
  }

  async buildRunAsWorkspaceMemberContext({
    workspaceMemberId,
    workspaceId,
    viaApplication,
  }: {
    workspaceMemberId: string;
    workspaceId: string;
    viaApplication?: FlatApplication;
  }): Promise<RunAsWorkspaceMemberContext> {
    const workspaceMember = await this.userWorkspaceService.getWorkspaceMember({
      workspaceMemberId,
      workspaceId,
    });

    if (!isDefined(workspaceMember)) {
      throw new AiException(
        `Workspace member ${workspaceMemberId} not found`,
        AiExceptionCode.RUN_AS_WORKSPACE_MEMBER_NOT_FOUND,
      );
    }

    const userWorkspace =
      await this.userWorkspaceService.getUserWorkspaceForUser({
        userId: workspaceMember.userId,
        workspaceId,
        relations: ['workspace', 'user'],
      });

    if (!isDefined(userWorkspace)) {
      throw new AiException(
        `Workspace member ${workspaceMemberId} has no user workspace`,
        AiExceptionCode.RUN_AS_WORKSPACE_MEMBER_NOT_FOUND,
      );
    }

    const roleId = await this.resolveRoleIdOrThrow({
      userWorkspaceId: userWorkspace.id,
      workspaceId,
      workspaceMemberId,
    });

    return {
      actorContext: buildCreatedByFromFullNameMetadata({
        fullNameMetadata: workspaceMember.name,
        workspaceMemberId: workspaceMember.id,
        source: FieldActorSource.AGENT,
      }),
      // viaApplication keeps the acting application on the swapped context for
      // provenance and future install-time grants; it is not the `application`
      // field on purpose, which would intersect the member's permissions with
      // the application's default role
      authContext: buildUserAuthContext({
        workspace: fromWorkspaceEntityToFlat(userWorkspace.workspace),
        userWorkspaceId: userWorkspace.id,
        user: fromUserEntityToFlat(userWorkspace.user),
        workspaceMemberId: workspaceMember.id,
        workspaceMember,
        viaApplication,
      }),
      roleId,
    };
  }

  private async resolveRoleIdOrThrow({
    userWorkspaceId,
    workspaceId,
    workspaceMemberId,
  }: {
    userWorkspaceId: string;
    workspaceId: string;
    workspaceMemberId: string;
  }): Promise<string> {
    try {
      return await this.userRoleService.getRoleIdForUserWorkspace({
        userWorkspaceId,
        workspaceId,
      });
    } catch (error) {
      if (
        error instanceof PermissionsException &&
        error.code === PermissionsExceptionCode.NO_ROLE_FOUND_FOR_USER_WORKSPACE
      ) {
        throw new AiException(
          `Workspace member ${workspaceMemberId} has no role assigned`,
          AiExceptionCode.RUN_AS_WORKSPACE_MEMBER_NOT_FOUND,
        );
      }

      throw error;
    }
  }
}
