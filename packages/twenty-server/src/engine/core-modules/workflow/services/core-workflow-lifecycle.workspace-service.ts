import { Injectable } from '@nestjs/common';

import { type ActorMetadata } from 'twenty-shared/types';

import { CoreWorkflowIdResolutionService } from 'src/engine/core-modules/workflow/services/core-workflow-id-resolution.service';
import { WorkflowCommonWorkspaceService } from 'src/modules/workflow/common/workspace-services/workflow-common.workspace-service';
import { WorkflowVersionValidationWorkspaceService } from 'src/modules/workflow/workflow-builder/workflow-validation/workflow-version-validation.workspace-service';
import { WorkflowTriggerWorkspaceService } from 'src/modules/workflow/workflow-trigger/workspace-services/workflow-trigger.workspace-service';

@Injectable()
export class CoreWorkflowLifecycleWorkspaceService {
  constructor(
    private readonly coreWorkflowIdResolutionService: CoreWorkflowIdResolutionService,
    private readonly workflowTriggerWorkspaceService: WorkflowTriggerWorkspaceService,
    private readonly workflowCommonWorkspaceService: WorkflowCommonWorkspaceService,
    private readonly workflowVersionValidationWorkspaceService: WorkflowVersionValidationWorkspaceService,
  ) {}

  async validateCoreWorkflowVersion({
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

    const workflowVersion =
      await this.workflowCommonWorkspaceService.getWorkflowVersionOrFail({
        workspaceId,
        workflowVersionId: workspaceWorkflowVersionId,
      });

    await this.workflowVersionValidationWorkspaceService.assertWorkflowVersionIsActivableOrThrow(
      {
        workspaceId,
        trigger: workflowVersion.trigger,
        steps: workflowVersion.steps,
      },
    );

    return true;
  }

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
