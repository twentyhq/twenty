import { Injectable } from '@nestjs/common';

import {
  WorkflowTriggerException,
  WorkflowTriggerExceptionCode,
} from 'src/engine/core-modules/workflow/workflow-trigger.exception';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';
import { WorkflowEventListenerWorkspaceEntity } from 'src/modules/workflow/standard-objects/workflow-event-listener.workspace-entity';
import {
  WorkflowInternalEventTrigger,
  WorkflowVersionTrigger,
  WorkflowVersionTriggerType,
  WorkflowVersionWorkspaceEntity,
} from 'src/modules/workflow/standard-objects/workflow-version.workspace-entity';

@Injectable()
export class WorkflowTriggerService {
  constructor(
    private readonly twentyORMGlobalManager: TwentyORMGlobalManager,
  ) {}

  async enableWorkflowTrigger(workspaceId: string, workflowVersionId: string) {
    const workflowVersionRepository =
      await this.twentyORMGlobalManager.getRepositoryForWorkspace<WorkflowVersionWorkspaceEntity>(
        workspaceId,
        'workflowVersion',
      );

    const workflowVersion = await workflowVersionRepository.findOne({
      where: {
        id: workflowVersionId,
      },
    });

    if (!workflowVersion) {
      throw new WorkflowTriggerException(
        'Workflow version not found',
        WorkflowTriggerExceptionCode.INVALID_INPUT,
      );
    }

    const trigger =
      workflowVersion.trigger as unknown as WorkflowVersionTrigger;

    if (!trigger || !trigger?.type) {
      throw new WorkflowTriggerException(
        'Workflow version does not contains trigger',
        WorkflowTriggerExceptionCode.INVALID_WORKFLOW_VERSION,
      );
    }

    switch (trigger.type) {
      case WorkflowVersionTriggerType.INTERNAL_EVENT:
        await this.executeInternalEventTrigger(
          workspaceId,
          workflowVersion.workflowId,
          trigger,
        );
        break;
      default:
        break;
    }

    return true;
  }

  private async executeInternalEventTrigger(
    workspaceId: string,
    workflowId: string,
    trigger: WorkflowInternalEventTrigger,
  ) {
    const eventName = trigger?.settings?.eventName;

    if (!eventName) {
      throw new WorkflowTriggerException(
        'No event name provided in internal event trigger',
        WorkflowTriggerExceptionCode.INVALID_WORKFLOW_TRIGGER,
      );
    }

    const workflowEventListenerRepository =
      await this.twentyORMGlobalManager.getRepositoryForWorkspace<WorkflowEventListenerWorkspaceEntity>(
        workspaceId,
        'workflowEventListener',
      );

    await workflowEventListenerRepository.delete({
      workflowId,
      eventName,
    });

    const workflowEventListener = await workflowEventListenerRepository.create({
      workflowId,
      eventName,
    });

    await workflowEventListenerRepository.save(workflowEventListener);
  }
}
