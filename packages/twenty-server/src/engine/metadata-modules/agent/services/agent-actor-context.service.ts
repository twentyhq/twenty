import { Injectable } from '@nestjs/common';

import { buildCreatedByFromFullNameMetadata } from 'src/engine/core-modules/actor/utils/build-created-by-from-full-name-metadata.util';
import { UserWorkspaceService } from 'src/engine/core-modules/user-workspace/user-workspace.service';
import {
  AgentException,
  AgentExceptionCode,
} from 'src/engine/metadata-modules/agent/agent.exception';
import { type ActorMetadata } from 'src/engine/metadata-modules/field-metadata/composite-types/actor.composite-type';
import { UserRoleService } from 'src/engine/metadata-modules/user-role/user-role.service';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';

export type AgentActorContext = {
  actorContext: ActorMetadata;
  roleContext: {
    roleIds: string[];
  };
};

@Injectable()
// eslint-disable-next-line @nx/workspace-inject-workspace-repository
export class AgentActorContextService {
  constructor(
    private readonly userWorkspaceService: UserWorkspaceService,
    private readonly userRoleService: UserRoleService,
    private readonly twentyORMGlobalManager: TwentyORMGlobalManager,
  ) {}

  async buildUserAndAgentActorContext(
    userWorkspaceId: string,
    agentId: string,
    workspaceId: string,
  ): Promise<AgentActorContext> {
    const userWorkspace =
      await this.userWorkspaceService.findById(userWorkspaceId);

    if (!userWorkspace) {
      throw new AgentException(
        'User workspace not found',
        AgentExceptionCode.AGENT_EXECUTION_FAILED,
      );
    }

    const workspaceMemberRepository =
      await this.twentyORMGlobalManager.getRepositoryForWorkspace(
        workspaceId,
        'workspaceMember',
        { shouldBypassPermissionChecks: true },
      );

    const workspaceMember = await workspaceMemberRepository.findOne({
      where: {
        userId: userWorkspace.userId,
      },
    });

    if (!workspaceMember) {
      throw new AgentException(
        'Workspace member not found for user',
        AgentExceptionCode.AGENT_EXECUTION_FAILED,
      );
    }

    const userRoleId = await this.userRoleService.getRoleIdForUserWorkspace({
      userWorkspaceId,
      workspaceId,
    });

    const actorContext = buildCreatedByFromFullNameMetadata({
      fullNameMetadata: workspaceMember.name,
      workspaceMemberId: workspaceMember.id,
    });

    const roleTargetsRepository =
      await this.twentyORMGlobalManager.getRepositoryForWorkspace(
        workspaceId,
        'roleTarget',
        { shouldBypassPermissionChecks: true },
      );

    const roleTarget = await roleTargetsRepository.findOne({
      where: {
        agentId,
        workspaceId,
      },
    });

    const agentRoleId = roleTarget?.roleId;

    if (!agentRoleId) {
      throw new AgentException(
        'Agent role not found',
        AgentExceptionCode.AGENT_EXECUTION_FAILED,
      );
    }

    if (!userRoleId) {
      throw new AgentException(
        'User role not found',
        AgentExceptionCode.AGENT_EXECUTION_FAILED,
      );
    }

    return {
      actorContext,
      roleContext: {
        roleIds: [userRoleId, agentRoleId],
      },
    };
  }
}
