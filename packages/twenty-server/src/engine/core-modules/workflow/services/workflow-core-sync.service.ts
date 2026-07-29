import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { isNonEmptyString } from '@sniptt/guards';
import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { isDefined } from 'twenty-shared/utils';
import { In, Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';

import { WorkflowEntity } from 'src/engine/core-modules/workflow/entities/workflow.entity';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { InjectWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/inject-workspace-scoped-repository.decorator';
import { WorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/workspace-scoped-repository';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { type WorkflowWorkspaceEntity } from 'src/modules/workflow/common/standard-objects/workflow.workspace-entity';

@Injectable()
export class WorkflowCoreSyncService {
  private readonly logger = new Logger(WorkflowCoreSyncService.name);

  constructor(
    @InjectWorkspaceScopedRepository(WorkflowEntity)
    private readonly coreWorkflowRepository: WorkspaceScopedRepository<WorkflowEntity>,
    @InjectRepository(WorkspaceEntity)
    private readonly workspaceRepository: Repository<WorkspaceEntity>,
    private readonly globalWorkspaceOrmManager: GlobalWorkspaceOrmManager,
    private readonly workspaceCacheService: WorkspaceCacheService,
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
      const coreWorkflowId = isNonEmptyString(workflow.coreWorkflowId)
        ? workflow.coreWorkflowId
        : uuidv4();

      if (!isNonEmptyString(workflow.coreWorkflowId)) {
        coreWorkflowIdByWorkspaceRecordId.set(workflow.id, coreWorkflowId);
      }

      return {
        id: coreWorkflowId,
        name: workflow.name ?? null,
        lastPublishedVersionId: isNonEmptyString(
          workflow.lastPublishedVersionId,
        )
          ? workflow.lastPublishedVersionId
          : null,
        universalIdentifier: uuidv4(),
        applicationId,
      };
    });

    await this.coreWorkflowRepository.upsert(workspaceId, coreRows, ['id']);

    await this.writeBackCoreWorkflowIds(
      workspaceId,
      coreWorkflowIdByWorkspaceRecordId,
    );
  }

  async deleteFromCore(
    workspaceId: string,
    coreWorkflowIds: string[],
  ): Promise<void> {
    if (coreWorkflowIds.length === 0) {
      return;
    }

    await this.coreWorkflowRepository.delete(workspaceId, {
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

    if (!(await this.workspaceHasCoreWorkflowIdField(workspaceId))) {
      this.logger.warn(
        `workflow.coreWorkflowId field missing for workspace ${workspaceId}, skipping core id write-back`,
      );

      return;
    }

    await this.globalWorkspaceOrmManager.executeInWorkspaceContext(async () => {
      const workspaceWorkflowRepository =
        await this.globalWorkspaceOrmManager.getRepository<WorkflowWorkspaceEntity>(
          workspaceId,
          'workflow',
          { shouldBypassPermissionChecks: true },
        );

      for (const [
        workspaceRecordId,
        coreWorkflowId,
      ] of coreWorkflowIdByWorkspaceRecordId) {
        await workspaceWorkflowRepository.update(workspaceRecordId, {
          coreWorkflowId,
        });
      }
    }, buildSystemAuthContext(workspaceId));
  }

  private async workspaceHasCoreWorkflowIdField(
    workspaceId: string,
  ): Promise<boolean> {
    const { flatFieldMetadataMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatFieldMetadataMaps',
      ]);

    return isDefined(
      flatFieldMetadataMaps.byUniversalIdentifier[
        STANDARD_OBJECTS.workflow.fields.coreWorkflowId.universalIdentifier
      ],
    );
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
