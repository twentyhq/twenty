import { Controller, Get, Param, UseFilters } from '@nestjs/common';

import { isDefined } from 'twenty-shared';

import { WorkflowTriggerWorkspaceService } from 'src/modules/workflow/workflow-trigger/workspace-services/workflow-trigger.workspace-service';
import { TwentyORMManager } from 'src/engine/twenty-orm/twenty-orm.manager';
import { WorkflowWorkspaceEntity } from 'src/modules/workflow/common/standard-objects/workflow.workspace-entity';
import { FieldActorSource } from 'src/engine/metadata-modules/field-metadata/composite-types/actor.composite-type';
import { WorkflowTriggerRestApiExceptionFilter } from 'src/engine/core-modules/workflow/filters/workflow-trigger-rest-api-exception.filter';
import {
  WorkflowTriggerException,
  WorkflowTriggerExceptionCode,
} from 'src/modules/workflow/workflow-trigger/exceptions/workflow-trigger.exception';

@Controller('webhooks')
@UseFilters(WorkflowTriggerRestApiExceptionFilter)
export class WorkflowTriggerController {
  constructor(
    private readonly twentyORMManager: TwentyORMManager,
    private readonly workflowTriggerWorkspaceService: WorkflowTriggerWorkspaceService,
  ) {}

  @Get('workflows/:workspaceId/:workflowId')
  async runWorkflow(
    @Param('workspaceId') workspaceId: string,
    @Param('workflowId') workflowId: string,
  ) {
    const workflowRepository =
      await this.twentyORMManager.getRepository<WorkflowWorkspaceEntity>(
        'workflow',
      );

    const workflow = await workflowRepository.findOne({
      where: { id: workflowId },
    });

    if (!isDefined(workflow)) {
      throw new WorkflowTriggerException(
        'Workflow not found',
        WorkflowTriggerExceptionCode.NOT_FOUND,
      );
    }

    if (!isDefined(workflow.lastPublishedVersionId)) {
      throw new WorkflowTriggerException(
        'Workflow not activated',
        WorkflowTriggerExceptionCode.INVALID_WORKFLOW_STATUS,
      );
    }

    return await this.workflowTriggerWorkspaceService.runWorkflowVersion({
      workflowVersionId: workflow.lastPublishedVersionId,
      payload: {},
      createdBy: {
        source: FieldActorSource.WEBHOOK,
        workspaceMemberId: null,
        name: '',
        context: {},
      },
    });
  }
}
