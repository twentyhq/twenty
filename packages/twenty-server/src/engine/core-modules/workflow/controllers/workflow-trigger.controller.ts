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
import { FieldActorSource } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { WorkflowTriggerRestApiExceptionFilter } from 'src/engine/core-modules/workflow/filters/workflow-trigger-rest-api-exception.filter';
import { NoPermissionGuard } from 'src/engine/guards/no-permission.guard';
import { PublicEndpointGuard } from 'src/engine/guards/public-endpoint.guard';
import { PermissionsGraphqlApiExceptionFilter } from 'src/engine/metadata-modules/permissions/utils/permissions-graphql-api-exception.filter';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import {
  WorkflowVersionStatus,
  type WorkflowVersionWorkspaceEntity,
} from 'src/modules/workflow/common/standard-objects/workflow-version.workspace-entity';
import { type WorkflowWorkspaceEntity } from 'src/modules/workflow/common/standard-objects/workflow.workspace-entity';
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
    private readonly globalWorkspaceOrmManager: GlobalWorkspaceOrmManager,
    private readonly workflowTriggerWorkspaceService: WorkflowTriggerWorkspaceService,
  ) {}

  @Post('workflows/:workspaceId/:workflowId')
  @UseGuards(PublicEndpointGuard, NoPermissionGuard)
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
  @UseGuards(PublicEndpointGuard, NoPermissionGuard)
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
    const authContext = buildSystemAuthContext(workspaceId);

    const { workflow } =
      await this.globalWorkspaceOrmManager.executeInWorkspaceContext(
        authContext,
        async () => {
          const workflowRepository =
            await this.globalWorkspaceOrmManager.getRepository<WorkflowWorkspaceEntity>(
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
            await this.globalWorkspaceOrmManager.getRepository<WorkflowVersionWorkspaceEntity>(
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

          return { workflow, workflowVersion };
        },
      );

    const { workflowRunId } =
      await this.workflowTriggerWorkspaceService.runWorkflowVersion({
        workflowVersionId: workflow.lastPublishedVersionId!,
        payload: payload || {},
        createdBy: {
          source: FieldActorSource.WEBHOOK,
          workspaceMemberId: null,
          name: 'Webhook',
          context: {},
        },
        workspaceId,
      });

    return {
      workflowName: workflow.name,
      success: true,
      workflowRunId,
    };
  }
}
