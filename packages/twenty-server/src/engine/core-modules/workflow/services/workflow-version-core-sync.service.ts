import { Injectable } from '@nestjs/common';

import { WorkflowVersionEntity } from 'src/engine/core-modules/workflow/entities/workflow-version.entity';
import { InjectWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/inject-workspace-scoped-repository.decorator';
import { WorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/workspace-scoped-repository';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

@Injectable()
export class WorkflowVersionCoreSyncService {
  constructor(
    @InjectWorkspaceScopedRepository(WorkflowVersionEntity)
    private readonly coreWorkflowVersionRepository: WorkspaceScopedRepository<WorkflowVersionEntity>,
    private readonly workspaceCacheService: WorkspaceCacheService,
  ) {}

  async findCoreVersionById(
    workspaceId: string,
    coreWorkflowVersionId: string,
  ): Promise<WorkflowVersionEntity | null> {
    return this.coreWorkflowVersionRepository.findOne(workspaceId, {
      where: { id: coreWorkflowVersionId },
    });
  }

  async findCoreVersionByWorkspaceVersionId(
    workspaceId: string,
    workspaceWorkflowVersionId: string,
  ): Promise<WorkflowVersionEntity | null> {
    return this.coreWorkflowVersionRepository.findOne(workspaceId, {
      where: { workspaceWorkflowVersionId },
    });
  }

  async invalidateAutomatedTriggerMaps(workspaceId: string): Promise<void> {
    await this.workspaceCacheService.invalidateAndRecompute(workspaceId, [
      'workflowAutomatedTriggerMaps',
    ]);
  }
}
