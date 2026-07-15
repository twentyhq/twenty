import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { isDefined } from 'twenty-shared/utils';
import { In, Repository } from 'typeorm';
import { v4 as uuidv4, v5 as uuidv5 } from 'uuid';

import { WorkflowEntity } from 'src/engine/core-modules/workflow/entities/workflow.entity';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { InjectWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/inject-workspace-scoped-repository.decorator';
import { WorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/workspace-scoped-repository';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { type WorkflowWorkspaceEntity } from 'src/modules/workflow/common/standard-objects/workflow.workspace-entity';

// Deriving the core id deterministically from workspaceId + record id makes the
// upsert idempotent across retries: a failed write-back re-derives the same id
// instead of orphaning a row.
const CORE_WORKFLOW_ID_NAMESPACE = '4e8433e7-363e-43cf-b7db-97770a37b2d0';

@Injectable()
export class WorkflowCoreSyncService {
  constructor(
    @InjectWorkspaceScopedRepository(WorkflowEntity)
    private readonly workflowRepository: WorkspaceScopedRepository<WorkflowEntity>,
    @InjectRepository(WorkspaceEntity)
    private readonly workspaceRepository: Repository<WorkspaceEntity>,
    private readonly globalWorkspaceOrmManager: GlobalWorkspaceOrmManager,
  ) {}

  async upsertToCore(
    workspaceId: string,
    workflows: WorkflowWorkspaceEntity[],
  ): Promise<void> {
    if (workflows.length === 0) {
      return;
    }

    const applicationId = await this.getCustomApplicationIdOrThrow(workspaceId);

    const coreWorkflowIdByWorkspaceRecordId = new Map<string, string>();

    const coreRows = workflows.map((workflow) => {
      const coreWorkflowId =
        workflow.coreWorkflowId ??
        uuidv5(`${workspaceId}:${workflow.id}`, CORE_WORKFLOW_ID_NAMESPACE);

      if (!isDefined(workflow.coreWorkflowId)) {
        coreWorkflowIdByWorkspaceRecordId.set(workflow.id, coreWorkflowId);
      }

      return {
        id: coreWorkflowId,
        name: workflow.name ?? null,
        lastPublishedVersionId: workflow.lastPublishedVersionId ?? null,
        universalIdentifier: uuidv4(),
        applicationId,
      };
    });

    await this.purgeSharedIdCoreRows(
      workspaceId,
      Array.from(coreWorkflowIdByWorkspaceRecordId.keys()),
    );

    await this.workflowRepository.upsert(workspaceId, coreRows, ['id']);

    await this.writeBackCoreWorkflowIds(
      workspaceId,
      coreWorkflowIdByWorkspaceRecordId,
    );
  }

  // The pre-soft-ref model wrote core rows with id === workspace record id.
  // Delete those before creating own-id rows, otherwise re-migration orphans
  // them.
  private async purgeSharedIdCoreRows(
    workspaceId: string,
    workspaceRecordIds: string[],
  ): Promise<void> {
    if (workspaceRecordIds.length === 0) {
      return;
    }

    await this.workflowRepository.delete(workspaceId, {
      id: In(workspaceRecordIds),
    });
  }

  async deleteFromCore(
    workspaceId: string,
    coreWorkflowIds: string[],
  ): Promise<void> {
    if (coreWorkflowIds.length === 0) {
      return;
    }

    await this.workflowRepository.delete(workspaceId, {
      id: In(coreWorkflowIds),
    });
  }

  private async writeBackCoreWorkflowIds(
    workspaceId: string,
    coreWorkflowIdByWorkspaceRecordId: Map<string, string>,
  ): Promise<void> {
    if (coreWorkflowIdByWorkspaceRecordId.size === 0) {
      return;
    }

    await this.globalWorkspaceOrmManager.executeInWorkspaceContext(async () => {
      const workflowRepository =
        await this.globalWorkspaceOrmManager.getRepository<WorkflowWorkspaceEntity>(
          workspaceId,
          'workflow',
          { shouldBypassPermissionChecks: true },
        );

      for (const [
        workspaceRecordId,
        coreWorkflowId,
      ] of coreWorkflowIdByWorkspaceRecordId) {
        await workflowRepository.update(workspaceRecordId, { coreWorkflowId });
      }
    }, buildSystemAuthContext(workspaceId));
  }

  private async getCustomApplicationIdOrThrow(
    workspaceId: string,
  ): Promise<string> {
    const workspace = await this.workspaceRepository.findOne({
      where: { id: workspaceId },
      select: ['id', 'workspaceCustomApplicationId'],
    });

    if (!isDefined(workspace?.workspaceCustomApplicationId)) {
      throw new Error(
        `Workspace custom application not found for workspace ${workspaceId}`,
      );
    }

    return workspace.workspaceCustomApplicationId;
  }
}
