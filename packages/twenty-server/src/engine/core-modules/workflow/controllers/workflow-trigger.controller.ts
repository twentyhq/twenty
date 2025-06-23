import {
  Controller,
  Get,
  Param,
  Post,
  Req,
  UseFilters,
  UseGuards,
} from '@nestjs/common';

import { Request } from 'express';
import { isDefined } from 'twenty-shared/utils';

import { WorkflowTriggerRestApiExceptionFilter } from 'src/engine/core-modules/workflow/filters/workflow-trigger-rest-api-exception.filter';
import { PublicEndpointGuard } from 'src/engine/guards/public-endpoint.guard';
import { FieldActorSource } from 'src/engine/metadata-modules/field-metadata/composite-types/actor.composite-type';
import { PermissionsGraphqlApiExceptionFilter } from 'src/engine/metadata-modules/permissions/utils/permissions-graphql-api-exception.filter';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';
import {
  WorkflowVersionStatus,
  WorkflowVersionWorkspaceEntity,
} from 'src/modules/workflow/common/standard-objects/workflow-version.workspace-entity';
import { WorkflowWorkspaceEntity } from 'src/modules/workflow/common/standard-objects/workflow.workspace-entity';
import {
  WorkflowTriggerException,
  WorkflowTriggerExceptionCode,
} from 'src/modules/workflow/workflow-trigger/exceptions/workflow-trigger.exception';
import { WorkflowTriggerType } from 'src/modules/workflow/workflow-trigger/types/workflow-trigger.type';
import { WorkflowTriggerWorkspaceService } from 'src/modules/workflow/workflow-trigger/workspace-services/workflow-trigger.workspace-service';

@Controller('webhooks')
@UseFilters(
  WorkflowTriggerRestApiExceptionFilter,
  PermissionsGraphqlApiExceptionFilter,
)
export class WorkflowTriggerController {
  constructor(
    private readonly twentyORMGlobalManager: TwentyORMGlobalManager,
    private readonly workflowTriggerWorkspaceService: WorkflowTriggerWorkspaceService,
  ) {}

  @Post('workflows/:workspaceId/:workflowId')
  @UseGuards(PublicEndpointGuard)
  async runWorkflowByPostRequest(
    @Param('workspaceId') workspaceId: string,
    @Param('workflowId') workflowId: string,
    @Req() request: Request,
  ) {
    return await this.runWorkflow({
      workflowId,
      payload: request.body || {},
      workspaceId,
    });
  }

  @Get('workflows/:workspaceId/:workflowId')
  @UseGuards(PublicEndpointGuard)
  async runWorkflowByGetRequest(
    @Param('workspaceId') workspaceId: string,
    @Param('workflowId') workflowId: string,
  ) {
    return await this.runWorkflow({ workflowId, workspaceId });
  }

  private async runWorkflow({
    workflowId,
    payload,
    workspaceId,
  }: {
    workflowId: string;
    payload?: object;
    workspaceId: string;
  }) {
    const workflowRepository =
      await this.twentyORMGlobalManager.getRepositoryForWorkspace<WorkflowWorkspaceEntity>(
        workspaceId,
        'workflow',
        { shouldBypassPermissionChecks: true },
      );

    const workflow = await workflowRepository.findOne({
      where: { id: workflowId },
    });

    if (!isDefined(workflow)) {
      throw new WorkflowTriggerException(
        `[Webhook trigger] Workflow ${workflowId} not found in workspace ${workspaceId}`,
        WorkflowTriggerExceptionCode.NOT_FOUND,
      );
    }

    if (
      !isDefined(workflow.lastPublishedVersionId) ||
      workflow.lastPublishedVersionId === ''
    ) {
      throw new WorkflowTriggerException(
        `[Webhook trigger] Workflow ${workflowId} has not been activated in workspace ${workspaceId}`,
        WorkflowTriggerExceptionCode.INVALID_WORKFLOW_STATUS,
      );
    }

    const workflowVersionRepository =
      await this.twentyORMGlobalManager.getRepositoryForWorkspace<WorkflowVersionWorkspaceEntity>(
        workspaceId,
        'workflowVersion',
        { shouldBypassPermissionChecks: true },
      );
    const workflowVersion = await workflowVersionRepository.findOne({
      where: { id: workflow.lastPublishedVersionId },
    });

    if (!isDefined(workflowVersion)) {
      throw new WorkflowTriggerException(
        `[Webhook trigger] No workflow version activated for workflow ${workflowId} in workspace ${workspaceId}`,
        WorkflowTriggerExceptionCode.INVALID_WORKFLOW_VERSION,
      );
    }

    if (workflowVersion.trigger?.type !== WorkflowTriggerType.WEBHOOK) {
      throw new WorkflowTriggerException(
        `[Webhook trigger] Workflow ${workflowId} does not have a Webhook trigger in workspace ${workspaceId}`,
        WorkflowTriggerExceptionCode.INVALID_WORKFLOW_TRIGGER,
      );
    }

    if (workflowVersion.status !== WorkflowVersionStatus.ACTIVE) {
      throw new WorkflowTriggerException(
        `[Webhook trigger] Workflow version ${workflowVersion.id} is not active in workspace ${workspaceId}`,
        WorkflowTriggerExceptionCode.INVALID_WORKFLOW_STATUS,
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
