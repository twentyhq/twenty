import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import {
  WorkflowVersionEntity,
  WorkflowVersionStatus,
} from 'src/engine/core-modules/workflow/entities/workflow-version.entity';
import { type WorkflowAutomatedTriggerMaps } from 'src/engine/core-modules/workflow/types/workflow-automated-trigger-maps.type';
import { computeAutomatedTriggerFromWorkflowVersion } from 'src/engine/core-modules/workflow/utils/compute-automated-trigger-from-workflow-version.util';
import { InjectWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/inject-workspace-scoped-repository.decorator';
import { WorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/workspace-scoped-repository';
import { WorkspaceCache } from 'src/engine/workspace-cache/decorators/workspace-cache.decorator';
import { WorkspaceCacheProvider } from 'src/engine/workspace-cache/interfaces/workspace-cache-provider.service';

@Injectable()
@WorkspaceCache('workflowAutomatedTriggerMaps')
export class WorkspaceWorkflowAutomatedTriggerMapCacheService extends WorkspaceCacheProvider<WorkflowAutomatedTriggerMaps> {
  constructor(
    @InjectWorkspaceScopedRepository(WorkflowVersionEntity)
    private readonly workflowVersionRepository: WorkspaceScopedRepository<WorkflowVersionEntity>,
  ) {
    super();
  }

  async computeForCache(
    workspaceId: string,
  ): Promise<WorkflowAutomatedTriggerMaps> {
    const activeWorkflowVersions = await this.workflowVersionRepository.find(
      workspaceId,
      { where: { status: WorkflowVersionStatus.ACTIVE } },
    );

    const byWorkflowId: WorkflowAutomatedTriggerMaps['byWorkflowId'] = {};

    for (const workflowVersion of activeWorkflowVersions) {
      const automatedTrigger =
        computeAutomatedTriggerFromWorkflowVersion(workflowVersion);

      if (isDefined(automatedTrigger)) {
        byWorkflowId[workflowVersion.workflowId] = automatedTrigger;
      }
    }

    return { byWorkflowId };
  }
}
