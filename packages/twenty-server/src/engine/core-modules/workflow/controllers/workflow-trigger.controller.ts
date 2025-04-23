import { Controller, Get, Param, Post, Req, UseFilters } from '@nestjs/common';

import { Request } from 'express';
import { isDefined } from 'twenty-shared/utils';

import { WorkflowTriggerRestApiExceptionFilter } from 'src/engine/core-modules/workflow/filters/workflow-trigger-rest-api-exception.filter';
import { FieldActorSource } from 'src/engine/metadata-modules/field-metadata/composite-types/actor.composite-type';
import { TwentyORMManager } from 'src/engine/twenty-orm/twenty-orm.manager';
import { WorkflowVersionWorkspaceEntity } from 'src/modules/workflow/common/standard-objects/workflow-version.workspace-entity';
import { WorkflowWorkspaceEntity } from 'src/modules/workflow/common/standard-objects/workflow.workspace-entity';
import {
  WorkflowTriggerException,
  WorkflowTriggerExceptionCode,
} from 'src/modules/workflow/workflow-trigger/exceptions/workflow-trigger.exception';
import { WorkflowTriggerType } from 'src/modules/workflow/workflow-trigger/types/workflow-trigger.type';
import { WorkflowTriggerWorkspaceService } from 'src/modules/workflow/workflow-trigger/workspace-services/workflow-trigger.workspace-service';

@Controller('webhooks')
@UseFilters(WorkflowTriggerRestApiExceptionFilter)
export class WorkflowTriggerController {
  constructor(
    private readonly twentyORMManager: TwentyORMManager,
    private readonly workflowTriggerWorkspaceService: WorkflowTriggerWorkspaceService,
  ) {}

  @Post('workflows/:workspaceId/:workflowId')
  async runWorkflowByPostRequest(
    @Param('workflowId') workflowId: string,
    @Req() request: Request,
  ) {
    return await this.runWorkflow({ workflowId, payload: request.body || {} });
  }

  @Get('workflows/:workspaceId/:workflowId')
  async runWorkflowByGetRequest(@Param('workflowId') workflowId: string) {
    return await this.runWorkflow({ workflowId });
  }

  private async runWorkflow({
    workflowId,
    payload,
  }: {
    workflowId: string;
    payload?: object;
  }) {
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

    if (
      !isDefined(workflow.lastPublishedVersionId) ||
      workflow.lastPublishedVersionId === ''
    ) {
      throw new WorkflowTriggerException(
        'Workflow not activated',
        WorkflowTriggerExceptionCode.INVALID_WORKFLOW_STATUS,
      );
    }

    const workflowVersionRepository =
      await this.twentyORMManager.getRepository<WorkflowVersionWorkspaceEntity>(
        'workflowVersion',
      );
    const workflowVersion = await workflowVersionRepository.findOne({
      where: { id: workflow.lastPublishedVersionId },
    });

    if (!isDefined(workflowVersion)) {
      throw new WorkflowTriggerException(
        'Workflow version not found',
        WorkflowTriggerExceptionCode.INVALID_WORKFLOW_VERSION,
      );
    }

    if (workflowVersion.trigger?.type !== WorkflowTriggerType.WEBHOOK) {
      throw new WorkflowTriggerException(
        'Workflow does not have a Webhook trigger',
        WorkflowTriggerExceptionCode.INVALID_WORKFLOW_TRIGGER,
      );
    }

    const { workflowRunId } =
      await this.workflowTriggerWorkspaceService.runWorkflowVersion({
        workflowVersionId: workflow.lastPublishedVersionId,
        payload: payload || {},
        createdBy: {
          source: FieldActorSource.WEBHOOK,
          workspaceMemberId: null,
          name: 'Webhook',
          context: {},
        },
      });

    return {
      workflowName: workflow.name,
      success: true,
      workflowRunId,
    };
  }
}
