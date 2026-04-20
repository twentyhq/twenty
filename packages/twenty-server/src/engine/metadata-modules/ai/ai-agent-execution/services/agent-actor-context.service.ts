import { Injectable } from '@nestjs/common';

import { type ActorMetadata } from 'twenty-shared/types';

import { buildCreatedByFromFullNameMetadata } from 'src/engine/core-modules/actor/utils/build-created-by-from-full-name-metadata.util';
import { UserWorkspaceService } from 'src/engine/core-modules/user-workspace/user-workspace.service';
import {
  AiException,
  AiExceptionCode,
} from 'src/engine/metadata-modules/ai/ai.exception';
import { UserRoleService } from 'src/engine/metadata-modules/user-role/user-role.service';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';

export type UserContext = {
  firstName: string;
  lastName: string;
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
    });

    const userContext: UserContext = {
      firstName: workspaceMember.name?.firstName ?? '',
      lastName: workspaceMember.name?.lastName ?? '',
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
}
