import { Injectable } from '@nestjs/common';

import { isNonEmptyArray } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';
import { In } from 'typeorm';

import { UserWorkspaceSuccessorService } from 'src/engine/core-modules/user-workspace/services/user-workspace-successor.service';
import { type UserWorkspaceEntity } from 'src/engine/core-modules/user-workspace/user-workspace.entity';
import { AgentEntity } from 'src/engine/metadata-modules/ai/ai-agent/entities/agent.entity';
import { InjectWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/inject-workspace-scoped-repository.decorator';
import { WorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/workspace-scoped-repository';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

@Injectable()
export class AgentOwnershipTransferService {
  constructor(
    private readonly userWorkspaceSuccessorService: UserWorkspaceSuccessorService,
    @InjectWorkspaceScopedRepository(AgentEntity)
    private readonly agentRepository: WorkspaceScopedRepository<AgentEntity>,
    private readonly workspaceCacheService: WorkspaceCacheService,
  ) {}

  async transferAgentsOwnershipToSuccessor({
    removedUserWorkspace,
    actingUserWorkspaceId,
  }: {
    removedUserWorkspace: UserWorkspaceEntity;
    actingUserWorkspaceId?: string;
  }): Promise<void> {
    const { workspaceId } = removedUserWorkspace;

    const agentsOfRemovedMember = await this.agentRepository.find(workspaceId, {
      select: { id: true, isPrivate: true },
      where: { createdByUserWorkspaceId: removedUserWorkspace.id },
    });

    if (!isNonEmptyArray(agentsOfRemovedMember)) {
      return;
    }

    const privateAgentIds = agentsOfRemovedMember
      .filter(({ isPrivate }) => isPrivate)
      .map(({ id }) => id);

    const successorUserWorkspace = isNonEmptyArray(privateAgentIds)
      ? await this.userWorkspaceSuccessorService.findSuccessorUserWorkspace({
          removedUserWorkspace,
          actingUserWorkspaceId,
        })
      : undefined;

    if (isDefined(successorUserWorkspace)) {
      await this.agentRepository.update(
        workspaceId,
        {
          id: In(privateAgentIds),
          createdByUserWorkspaceId: removedUserWorkspace.id,
        },
        { createdByUserWorkspaceId: successorUserWorkspace.id },
      );
    }

    await this.agentRepository.update(
      workspaceId,
      { createdByUserWorkspaceId: removedUserWorkspace.id },
      { createdByUserWorkspaceId: null },
    );

    await this.workspaceCacheService.invalidateAndRecompute(workspaceId, [
      'flatAgentMaps',
    ]);
  }
}
