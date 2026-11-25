import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { type QueueJobScope } from 'src/engine/core-modules/message-queue/drivers/interfaces/job-options.interface';
import { type AgentRunSpec } from 'src/engine/metadata-modules/ai/ai-agent-execution/types/agent-run-spec.type';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

@Injectable()
export class AgentRunJobScopeService {
  constructor(private readonly workspaceCacheService: WorkspaceCacheService) {}

  async resolve({
    workspaceId,
    spec,
  }: {
    workspaceId: string;
    spec: Pick<AgentRunSpec, 'agentId' | 'inlineConfig'>;
  }): Promise<QueueJobScope> {
    const applicationUniversalIdentifier = isDefined(spec.agentId)
      ? await this.findAgentApplicationUniversalIdentifier({
          workspaceId,
          agentId: spec.agentId,
        })
      : await this.findApplicationUniversalIdentifier({
          workspaceId,
          applicationId: spec.inlineConfig?.applicationId ?? null,
        });

    return isDefined(applicationUniversalIdentifier)
      ? { workspaceId, applicationUniversalIdentifier }
      : { workspaceId, isWorkspaceJob: true };
  }

  private async findAgentApplicationUniversalIdentifier({
    workspaceId,
    agentId,
  }: {
    workspaceId: string;
    agentId: string;
  }): Promise<string | undefined> {
    const { flatAgentMaps } = await this.workspaceCacheService.getOrRecompute(
      workspaceId,
      ['flatAgentMaps'],
    );

    return findFlatEntityByIdInFlatEntityMaps({
      flatEntityId: agentId,
      flatEntityMaps: flatAgentMaps,
    })?.applicationUniversalIdentifier;
  }

  private async findApplicationUniversalIdentifier({
    workspaceId,
    applicationId,
  }: {
    workspaceId: string;
    applicationId: string | null;
  }): Promise<string | undefined> {
    if (!isDefined(applicationId)) {
      return undefined;
    }

    const { flatApplicationMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatApplicationMaps',
      ]);

    return flatApplicationMaps.byId[applicationId]?.universalIdentifier;
  }
}
