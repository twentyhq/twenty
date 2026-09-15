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

import { isNonEmptyString } from '@sniptt/guards';
import { Request } from 'express';
import { ApiPath, FieldActorSource } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { Repository } from 'typeorm';

import {
  WorkflowVersionEntity,
  WorkflowVersionStatus,
} from 'src/engine/core-modules/workflow/entities/workflow-version.entity';
import { WorkflowEntity } from 'src/engine/core-modules/workflow/entities/workflow.entity';
import { WorkflowTriggerRestApiExceptionFilter } from 'src/engine/core-modules/workflow/filters/workflow-trigger-rest-api-exception.filter';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { NoPermissionGuard } from 'src/engine/guards/no-permission.guard';
import { PublicEndpointGuard } from 'src/engine/guards/public-endpoint.guard';
import { PermissionsGraphqlApiExceptionFilter } from 'src/engine/metadata-modules/permissions/utils/permissions-graphql-api-exception.filter';
import { InjectWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/inject-workspace-scoped-repository.decorator';
import { WorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/workspace-scoped-repository';
import {
  TwentyOrmException,
  TwentyOrmExceptionCode,
} from 'src/engine/twenty-orm/exceptions/twenty-orm.exception';
import {
  WorkflowTriggerException,
  WorkflowTriggerExceptionCode,
} from 'src/modules/workflow/workflow-trigger/exceptions/workflow-trigger.exception';
import { WorkflowTriggerType } from 'src/modules/workflow/workflow-trigger/types/workflow-trigger.type';
import { WorkflowTriggerWorkspaceService } from 'src/modules/workflow/workflow-trigger/workspace-services/workflow-trigger.workspace-service';

@Controller(ApiPath.Webhooks)
@UseFilters(
  WorkflowTriggerRestApiExceptionFilter,
  PermissionsGraphqlApiExceptionFilter,
)
export class WorkflowTriggerController {
  constructor(
    private readonly workflowTriggerWorkspaceService: WorkflowTriggerWorkspaceService,
    @InjectRepository(WorkspaceEntity)
    protected readonly workspaceRepository: Repository<WorkspaceEntity>,
    @InjectWorkspaceScopedRepository(WorkflowEntity)
    private readonly coreWorkflowRepository: WorkspaceScopedRepository<WorkflowEntity>,
    @InjectWorkspaceScopedRepository(WorkflowVersionEntity)
    private readonly coreWorkflowVersionRepository: WorkspaceScopedRepository<WorkflowVersionEntity>,
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
      const coreWorkflow = await this.findCoreWorkflowByWorkspaceOrCoreId({
        workspaceId,
        workflowId,
      });

      if (!isDefined(coreWorkflow)) {
        throw new WorkflowTriggerException(
          `[Webhook trigger] Workflow ${workflowId} not found in workspace ${workspaceId}`,
          WorkflowTriggerExceptionCode.NOT_FOUND,
        );
      }

      const coreWorkflowVersion =
        await this.findActivatedCoreWorkflowVersionOrThrow({
          workspaceId,
          workflowId,
          coreWorkflow,
        });

      if (
        !coreWorkflowVersion.triggers?.some(
          (trigger) => trigger.type === WorkflowTriggerType.WEBHOOK,
        )
      ) {
        throw new WorkflowTriggerException(
          `[Webhook trigger] Workflow ${workflowId} does not have a Webhook trigger in workspace ${workspaceId}`,
          WorkflowTriggerExceptionCode.INVALID_WORKFLOW_TRIGGER,
        );
      }

      if (coreWorkflowVersion.status !== WorkflowVersionStatus.ACTIVE) {
        throw new WorkflowTriggerException(
          `[Webhook trigger] Workflow version ${coreWorkflowVersion.id} is not active in workspace ${workspaceId}`,
          WorkflowTriggerExceptionCode.INVALID_WORKFLOW_STATUS,
        );
      }

      const workspaceWorkflowVersionId = coreWorkflow.lastPublishedVersionId;

      if (!isNonEmptyString(workspaceWorkflowVersionId)) {
        throw new WorkflowTriggerException(
          `[Webhook trigger] Workflow ${workflowId} has no mirrored workspace version to run in workspace ${workspaceId}`,
          WorkflowTriggerExceptionCode.INVALID_WORKFLOW_VERSION,
        );
      }

      const { workflowRunId } =
        await this.workflowTriggerWorkspaceService.runWorkflowVersion({
          workflowVersionId: workspaceWorkflowVersionId,
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
        workflowName: coreWorkflow.name,
        success: true,
        workflowRunId,
      };
    } catch (error) {
      this.rethrowWorkspaceNotFoundAsTriggerException(error, workspaceId);
    }
  }

  private async findCoreWorkflowByWorkspaceOrCoreId({
    workspaceId,
    workflowId,
  }: {
    workspaceId: string;
    workflowId: string;
  }): Promise<WorkflowEntity | null> {
    return await this.coreWorkflowRepository.findOne(workspaceId, {
      where: [{ id: workflowId }, { workspaceWorkflowId: workflowId }],
    });
  }

  private async findActivatedCoreWorkflowVersionOrThrow({
    workspaceId,
    workflowId,
    coreWorkflow,
  }: {
    workspaceId: string;
    workflowId: string;
    coreWorkflow: Pick<WorkflowEntity, 'lastPublishedCoreWorkflowVersionId'>;
  }): Promise<WorkflowVersionEntity> {
    if (!isNonEmptyString(coreWorkflow.lastPublishedCoreWorkflowVersionId)) {
      throw new WorkflowTriggerException(
        `[Webhook trigger] Workflow ${workflowId} has not been activated in workspace ${workspaceId}`,
        WorkflowTriggerExceptionCode.INVALID_WORKFLOW_STATUS,
      );
    }

    const coreWorkflowVersion =
      await this.coreWorkflowVersionRepository.findOne(workspaceId, {
        where: { id: coreWorkflow.lastPublishedCoreWorkflowVersionId },
      });

    if (!isDefined(coreWorkflowVersion)) {
      throw new WorkflowTriggerException(
        `[Webhook trigger] No workflow version activated for workflow ${workflowId} in workspace ${workspaceId}`,
        WorkflowTriggerExceptionCode.INVALID_WORKFLOW_VERSION,
      );
    }

    return coreWorkflowVersion;
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
