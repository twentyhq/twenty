import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';
import { In } from 'typeorm';

import {
  WorkflowVersionEntity,
  WorkflowVersionStatus,
} from 'src/engine/core-modules/workflow/entities/workflow-version.entity';
import { InjectWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/inject-workspace-scoped-repository.decorator';
import { WorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/workspace-scoped-repository';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { type WorkflowVersionWorkspaceEntity } from 'src/modules/workflow/common/standard-objects/workflow-version.workspace-entity';

@Injectable()
export class WorkflowVersionCoreSyncService {
  constructor(
    @InjectWorkspaceScopedRepository(WorkflowVersionEntity)
    private readonly workflowVersionRepository: WorkspaceScopedRepository<WorkflowVersionEntity>,
    private readonly workspaceCacheService: WorkspaceCacheService,
  ) {}

  async upsertToCore(
    workspaceId: string,
    workflowVersions: WorkflowVersionWorkspaceEntity[],
  ): Promise<void> {
    if (workflowVersions.length === 0) {
      return;
    }

    await this.workflowVersionRepository.upsert(
      workspaceId,
      workflowVersions.map((workflowVersion) => ({
        id: workflowVersion.id,
        workflowId: workflowVersion.workflowId,
        triggers: isDefined(workflowVersion.trigger)
          ? [workflowVersion.trigger]
          : null,
        steps: workflowVersion.steps ?? null,
        status: workflowVersion.status as unknown as WorkflowVersionStatus,
      })),
      ['id'],
    );

    await this.invalidateAutomatedTriggerMaps(workspaceId);
  }

  async deleteFromCore(
    workspaceId: string,
    workflowVersionIds: string[],
  ): Promise<void> {
    if (workflowVersionIds.length === 0) {
      return;
    }

    await this.workflowVersionRepository.delete(workspaceId, {
      id: In(workflowVersionIds),
    });

    await this.invalidateAutomatedTriggerMaps(workspaceId);
  }

  private async invalidateAutomatedTriggerMaps(
    workspaceId: string,
  ): Promise<void> {
    await this.workspaceCacheService.invalidateAndRecompute(workspaceId, [
      'workflowAutomatedTriggerMaps',
    ]);
  }
}
