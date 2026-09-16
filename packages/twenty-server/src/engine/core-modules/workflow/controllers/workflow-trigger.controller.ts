import {
  Controller,
  Get,
  Param,
  Post,
  Req,
  UseFilters,
  UseGuards,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Request } from 'express';
import { ApiPath, FieldActorSource } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { Repository } from 'typeorm';

import { WorkflowTriggerRestApiExceptionFilter } from 'src/engine/core-modules/workflow/filters/workflow-trigger-rest-api-exception.filter';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { NoPermissionGuard } from 'src/engine/guards/no-permission.guard';
import { PublicEndpointGuard } from 'src/engine/guards/public-endpoint.guard';
import { PermissionsGraphqlApiExceptionFilter } from 'src/engine/metadata-modules/permissions/utils/permissions-graphql-api-exception.filter';
import {
  TwentyOrmException,
  TwentyOrmExceptionCode,
} from 'src/engine/twenty-orm/exceptions/twenty-orm.exception';
import { WorkflowVersionStatus } from 'src/engine/core-modules/workflow/entities/workflow-version.entity';
import { WorkflowCoreSyncService } from 'src/engine/core-modules/workflow/services/workflow-core-sync.service';
import { WorkflowVersionCoreSyncService } from 'src/engine/core-modules/workflow/services/workflow-version-core-sync.service';
import { CoreWorkflowRunnerService } from 'src/modules/workflow/workflow-runner/services/core-workflow-runner.service';
import {
  WorkflowTriggerException,
  WorkflowTriggerExceptionCode,
} from 'src/modules/workflow/workflow-trigger/exceptions/workflow-trigger.exception';
import { WorkflowTriggerType } from 'src/modules/workflow/workflow-trigger/types/workflow-trigger.type';

@Controller(ApiPath.Webhooks)
@UseFilters(
  WorkflowTriggerRestApiExceptionFilter,
  PermissionsGraphqlApiExceptionFilter,
)
export class WorkflowTriggerController {
  constructor(
    private readonly workflowCoreSyncService: WorkflowCoreSyncService,
    private readonly workflowVersionCoreSyncService: WorkflowVersionCoreSyncService,
    private readonly coreWorkflowRunnerService: CoreWorkflowRunnerService,
    @InjectRepository(WorkspaceEntity)
    protected readonly workspaceRepository: Repository<WorkspaceEntity>,
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
    const workspaceExists = await this.workspaceRepository.existsBy({
      id: workspaceId,
    });

    if (!workspaceExists) {
      throw new WorkflowTriggerException(
        `[Webhook trigger] Workspace ${workspaceId} not found`,
        WorkflowTriggerExceptionCode.NOT_FOUND,
      );
    }

    try {
      const workflow =
        await this.workflowCoreSyncService.findCoreWorkflowByIdOrWorkspaceWorkflowId(
          workspaceId,
          workflowId,
        );

      if (!isDefined(workflow)) {
        throw new WorkflowTriggerException(
          `[Webhook trigger] Workflow ${workflowId} not found in workspace ${workspaceId}`,
          WorkflowTriggerExceptionCode.NOT_FOUND,
        );
      }

      if (!isDefined(workflow.lastPublishedCoreWorkflowVersionId)) {
        throw new WorkflowTriggerException(
          `[Webhook trigger] Workflow ${workflowId} has not been activated in workspace ${workspaceId}`,
          WorkflowTriggerExceptionCode.INVALID_WORKFLOW_STATUS,
        );
      }

      const workflowVersion =
        await this.workflowVersionCoreSyncService.findCoreVersionById(
          workspaceId,
          workflow.lastPublishedCoreWorkflowVersionId,
        );

      if (!isDefined(workflowVersion)) {
        throw new WorkflowTriggerException(
          `[Webhook trigger] No workflow version activated for workflow ${workflowId} in workspace ${workspaceId}`,
          WorkflowTriggerExceptionCode.INVALID_WORKFLOW_VERSION,
        );
      }

      if (workflowVersion.triggers?.[0]?.type !== WorkflowTriggerType.WEBHOOK) {
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

      const { workflowRunId } = await this.coreWorkflowRunnerService.run({
        coreWorkflowVersionId: workflowVersion.id,
        payload: payload || {},
        source: {
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
    } catch (error) {
      this.rethrowWorkspaceNotFoundAsTriggerException(error, workspaceId);
    }
  }

  private rethrowWorkspaceNotFoundAsTriggerException(
    error: unknown,
    workspaceId: string,
  ): never {
    if (
      error instanceof TwentyOrmException &&
      [
        TwentyOrmExceptionCode.WORKSPACE_NOT_FOUND,
        TwentyOrmExceptionCode.WORKSPACE_SCHEMA_NOT_FOUND,
      ].includes(error.code)
    ) {
      throw new WorkflowTriggerException(
        `[Webhook trigger] Workspace ${workspaceId} not found`,
        WorkflowTriggerExceptionCode.NOT_FOUND,
      );
    }

    throw error;
  }
}
