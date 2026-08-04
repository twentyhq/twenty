import { Injectable } from '@nestjs/common';

import { type ActorMetadata, FieldActorSource } from 'twenty-shared/types';

import { buildCreatedByFromFullNameMetadata } from 'src/engine/core-modules/actor/utils/build-created-by-from-full-name-metadata.util';
import { buildUserAuthContext } from 'src/engine/core-modules/auth/utils/build-user-auth-context.util';
import { fromUserEntityToFlat } from 'src/engine/core-modules/user/utils/from-user-entity-to-flat.util';
import { UserWorkspaceService } from 'src/engine/core-modules/user-workspace/user-workspace.service';
import { fromWorkspaceEntityToFlat } from 'src/engine/core-modules/workspace/utils/from-workspace-entity-to-flat.util';
import {
  AiException,
  AiExceptionCode,
} from 'src/engine/metadata-modules/ai/ai.exception';
import { type RunAsWorkspaceMemberContext } from 'src/engine/metadata-modules/ai/ai-agent-execution/types/run-as-workspace-member-context.type';
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
  }: {
    workspaceMemberId: string;
    workspaceId: string;
  }): Promise<RunAsWorkspaceMemberContext> {
    const workspaceMember =
      await this.userWorkspaceService.getWorkspaceMemberOrThrow({
        workspaceMemberId,
        workspaceId,
      });

    const userWorkspace =
      await this.userWorkspaceService.getUserWorkspaceForUserOrThrow({
        userId: workspaceMember.userId,
        workspaceId,
        relations: ['workspace', 'user'],
      });

    const roleId = await this.userRoleService.getRoleIdForUserWorkspace({
      userWorkspaceId: userWorkspace.id,
      workspaceId,
    });

    return {
      actorContext: buildCreatedByFromFullNameMetadata({
        fullNameMetadata: workspaceMember.name,
        workspaceMemberId: workspaceMember.id,
        source: FieldActorSource.AGENT,
      }),
      authContext: buildUserAuthContext({
        workspace: fromWorkspaceEntityToFlat(userWorkspace.workspace),
        userWorkspaceId: userWorkspace.id,
        user: fromUserEntityToFlat(userWorkspace.user),
        workspaceMemberId: workspaceMember.id,
        workspaceMember,
      }),
      roleId,
    };
  }
}
