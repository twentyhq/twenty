import { Injectable } from '@nestjs/common';

import { In } from 'typeorm';
import { isDefined } from 'twenty-shared/utils';
import { v4 as uuidv4 } from 'uuid';

import { RecordPositionService } from 'src/engine/core-modules/record-position/services/record-position.service';
import { type CoreWorkflowDTO } from 'src/engine/core-modules/workflow/dtos/core-workflow.dto';
import { WorkflowEntity } from 'src/engine/core-modules/workflow/entities/workflow.entity';
import { WorkflowCoreSyncService } from 'src/engine/core-modules/workflow/services/workflow-core-sync.service';
import { WorkflowVersionCoreSyncService } from 'src/engine/core-modules/workflow/services/workflow-version-core-sync.service';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { WorkspaceOrmManager } from 'src/engine/twenty-orm/workspace-orm.manager';
import { InjectWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/inject-workspace-scoped-repository.decorator';
import { WorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/workspace-scoped-repository';
import {
  WorkflowVersionStatus,
  type WorkflowVersionWorkspaceEntity,
} from 'src/modules/workflow/common/standard-objects/workflow-version.workspace-entity';
import {
  WorkflowStatus,
  type WorkflowWorkspaceEntity,
} from 'src/modules/workflow/common/standard-objects/workflow.workspace-entity';
import { WorkflowCommonWorkspaceService } from 'src/modules/workflow/common/workspace-services/workflow-common.workspace-service';

@Injectable()
export class CoreWorkflowMutationWorkspaceService {
  constructor(
    @InjectWorkspaceScopedRepository(WorkflowEntity)
    private readonly coreWorkflowRepository: WorkspaceScopedRepository<WorkflowEntity>,
    private readonly workflowCoreSyncService: WorkflowCoreSyncService,
    private readonly workflowVersionCoreSyncService: WorkflowVersionCoreSyncService,
    private readonly workflowCommonWorkspaceService: WorkflowCommonWorkspaceService,
    private readonly workspaceOrmManager: WorkspaceOrmManager,
    private readonly recordPositionService: RecordPositionService,
  ) {}

  async createWorkflow(
    workspaceId: string,
    { name }: { name?: string },
  ): Promise<CoreWorkflowDTO> {
    const applicationId =
      await this.workflowCoreSyncService.getCustomApplicationIdOrThrow(
        workspaceId,
      );

    const coreWorkflow = await this.coreWorkflowRepository.insertAndReturnOne(
      workspaceId,
      {
        id: uuidv4(),
        name: name ?? null,
        universalIdentifier: uuidv4(),
        applicationId,
      },
    );

    let workspaceWorkflowId: string;

    try {
      workspaceWorkflowId =
        await this.workspaceOrmManager.executeInWorkspaceContext(async () => {
          const workflowRepository =
            this.workspaceOrmManager.getRepository<WorkflowWorkspaceEntity>(
              'workflow',
              { shouldBypassPermissionChecks: true },
            );

          const position = await this.recordPositionService.buildRecordPosition(
            {
              value: 'first',
              objectMetadata: {
                isCustom: false,
                nameSingular: 'workflow',
              },
              workspaceId,
            },
          );

          const insertWorkflowResult = await workflowRepository.insert({
            name: name ?? null,
            position,
            coreWorkflowId: coreWorkflow.id,
          });

          return (
            insertWorkflowResult.generatedMaps[0] as WorkflowWorkspaceEntity
          ).id;
        }, buildSystemAuthContext(workspaceId));
    } catch (error) {
      await this.workflowCoreSyncService.deleteFromCore(workspaceId, [
        coreWorkflow.id,
      ]);

      throw error;
    }

    await this.workflowVersionCoreSyncService.writeWorkflowVersionAndMirror(
      workspaceId,
      async (workflowVersionRepository) => {
        const position = await this.recordPositionService.buildRecordPosition({
          value: 'first',
          objectMetadata: {
            isCustom: false,
            nameSingular: 'workflowVersion',
          },
          workspaceId,
        });

        const insertVersionResult = await workflowVersionRepository.insert({
          workflowId: workspaceWorkflowId,
          status: WorkflowVersionStatus.DRAFT,
          name: 'v1',
          position,
        });

        return (
          insertVersionResult.generatedMaps[0] as WorkflowVersionWorkspaceEntity
        ).id;
      },
    );

    return {
      id: coreWorkflow.id,
      name: coreWorkflow.name,
      statuses: [WorkflowStatus.DRAFT],
      applicationId,
      workspaceWorkflowId,
      updatedAt: coreWorkflow.updatedAt.toISOString(),
    };
  }

  async deleteWorkflows(
    workspaceId: string,
    { coreWorkflowIds }: { coreWorkflowIds: string[] },
  ): Promise<string[]> {
    const authContext = buildSystemAuthContext(workspaceId);

    const workflowsToDelete =
      await this.workspaceOrmManager.executeInWorkspaceContext(async () => {
        const workflowRepository =
          this.workspaceOrmManager.getRepository<WorkflowWorkspaceEntity>(
            'workflow',
            { shouldBypassPermissionChecks: true },
          );

        return workflowRepository.find({
          where: { coreWorkflowId: In(coreWorkflowIds) },
        });
      }, authContext);

    if (workflowsToDelete.length === 0) {
      return [];
    }

    const workflowIds = workflowsToDelete.map((workflow) => workflow.id);

    await this.workspaceOrmManager.executeInWorkspaceContext(async () => {
      const workflowRepository =
        this.workspaceOrmManager.getRepository<WorkflowWorkspaceEntity>(
          'workflow',
          { shouldBypassPermissionChecks: true },
        );

      await workflowRepository.softDelete({ id: In(workflowIds) });
    }, authContext);

    await this.workflowCommonWorkspaceService.handleWorkflowSubEntities({
      workflowIds,
      workspaceId,
      operation: 'delete',
    });

    const deletedCoreWorkflowIds = workflowsToDelete
      .map((workflow) => workflow.coreWorkflowId)
      .filter(isDefined);

    await this.workflowCoreSyncService.deleteFromCore(
      workspaceId,
      deletedCoreWorkflowIds,
    );

    return deletedCoreWorkflowIds;
  }
}
