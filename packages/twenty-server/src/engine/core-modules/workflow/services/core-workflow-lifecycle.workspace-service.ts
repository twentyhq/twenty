import { Injectable } from '@nestjs/common';

import { type ActorMetadata } from 'twenty-shared/types';

import { CoreWorkflowIdResolutionService } from 'src/engine/core-modules/workflow/services/core-workflow-id-resolution.service';
import { WorkflowTriggerWorkspaceService } from 'src/modules/workflow/workflow-trigger/workspace-services/workflow-trigger.workspace-service';

// Core-id twins of the lifecycle mutations. The core row is the entry
// authority; the activation machinery then updates both stores in one
// transaction, the workspace row being kept only as the rollback mirror.
@Injectable()
export class CoreWorkflowLifecycleWorkspaceService {
  constructor(
    private readonly coreWorkflowIdResolutionService: CoreWorkflowIdResolutionService,
    private readonly workflowTriggerWorkspaceService: WorkflowTriggerWorkspaceService,
  ) {}

  async activateCoreWorkflowVersion({
    workspaceId,
    coreWorkflowVersionId,
  }: {
    workspaceId: string;
    coreWorkflowVersionId: string;
  }): Promise<boolean> {
    const { workspaceWorkflowVersionId } =
      await this.coreWorkflowIdResolutionService.resolveWorkspaceVersionIdOrThrow(
        { workspaceId, coreWorkflowVersionId },
      );

    return this.workflowTriggerWorkspaceService.activateWorkflowVersion(
      workspaceWorkflowVersionId,
      workspaceId,
    );
  }

  async deactivateCoreWorkflowVersion({
    workspaceId,
    coreWorkflowVersionId,
  }: {
    workspaceId: string;
    coreWorkflowVersionId: string;
  }): Promise<boolean> {
    const { workspaceWorkflowVersionId } =
      await this.coreWorkflowIdResolutionService.resolveWorkspaceVersionIdOrThrow(
        { workspaceId, coreWorkflowVersionId },
      );

    return this.workflowTriggerWorkspaceService.deactivateWorkflowVersion(
      workspaceWorkflowVersionId,
      workspaceId,
    );
  }

  async runCoreWorkflowVersion({
    workspaceId,
    coreWorkflowVersionId,
    payload,
    createdBy,
    workflowRunId,
  }: {
    workspaceId: string;
    coreWorkflowVersionId: string;
    payload: object;
    createdBy: ActorMetadata;
    workflowRunId?: string;
  }): Promise<{ workflowRunId: string }> {
    const { workspaceWorkflowVersionId } =
      await this.coreWorkflowIdResolutionService.resolveWorkspaceVersionIdOrThrow(
        { workspaceId, coreWorkflowVersionId },
      );

    return this.workflowTriggerWorkspaceService.runWorkflowVersion({
      workflowVersionId: workspaceWorkflowVersionId,
      payload,
      createdBy,
      workflowRunId,
      workspaceId,
    });
  }
}
