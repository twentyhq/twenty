import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { type QueueJobScope } from 'src/engine/core-modules/message-queue/drivers/interfaces/job-options.interface';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

@Injectable()
export class AgentRunJobScopeService {
  constructor(private readonly workspaceCacheService: WorkspaceCacheService) {}

  async resolve({
    workspaceId,
    agentId,
  }: {
    workspaceId: string;
    agentId: string;
  }): Promise<QueueJobScope> {
    const { flatAgentMaps } = await this.workspaceCacheService.getOrRecompute(
      workspaceId,
      ['flatAgentMaps'],
    );

    const flatAgent = findFlatEntityByIdInFlatEntityMaps({
      flatEntityId: agentId,
      flatEntityMaps: flatAgentMaps,
    });

    return isDefined(flatAgent)
      ? {
          workspaceId,
          applicationUniversalIdentifier:
            flatAgent.applicationUniversalIdentifier,
        }
      : { workspaceId, isWorkspaceJob: true };
  }
}
