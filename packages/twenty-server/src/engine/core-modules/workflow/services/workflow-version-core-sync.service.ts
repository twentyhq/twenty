import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { isNonEmptyString } from '@sniptt/guards';
import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { isDefined } from 'twenty-shared/utils';
import { In, Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';

import {
  WorkflowVersionEntity,
  WorkflowVersionStatus,
} from 'src/engine/core-modules/workflow/entities/workflow-version.entity';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { InjectWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/inject-workspace-scoped-repository.decorator';
import { WorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/workspace-scoped-repository';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { type WorkflowVersionWorkspaceEntity } from 'src/modules/workflow/common/standard-objects/workflow-version.workspace-entity';

@Injectable()
export class WorkflowVersionCoreSyncService {
  private readonly logger = new Logger(WorkflowVersionCoreSyncService.name);

  constructor(
    @InjectWorkspaceScopedRepository(WorkflowVersionEntity)
    private readonly coreWorkflowVersionRepository: WorkspaceScopedRepository<WorkflowVersionEntity>,
    @InjectRepository(WorkspaceEntity)
    private readonly workspaceRepository: Repository<WorkspaceEntity>,
    private readonly globalWorkspaceOrmManager: GlobalWorkspaceOrmManager,
    private readonly workspaceCacheService: WorkspaceCacheService,
  ) {}

  async upsertToCore(
    workspaceId: string,
    workflowVersions: WorkflowVersionWorkspaceEntity[],
  ): Promise<void> {
    if (workflowVersions.length === 0) {
      return;
    }

    const applicationId = await this.getCustomApplicationIdOrThrow(workspaceId);

    const coreVersionIdByWorkspaceRecordId = new Map<string, string>();

    const coreRows = workflowVersions.map((workflowVersion) => {
      const coreWorkflowVersionId = isNonEmptyString(
        workflowVersion.coreWorkflowVersionId,
      )
        ? workflowVersion.coreWorkflowVersionId
        : uuidv4();

      if (!isNonEmptyString(workflowVersion.coreWorkflowVersionId)) {
        coreVersionIdByWorkspaceRecordId.set(
          workflowVersion.id,
          coreWorkflowVersionId,
        );
      }

      return {
        id: coreWorkflowVersionId,
        workflowId: workflowVersion.workflowId,
        triggers: isDefined(workflowVersion.trigger)
          ? [workflowVersion.trigger]
          : null,
        steps: workflowVersion.steps ?? null,
        status: workflowVersion.status as unknown as WorkflowVersionStatus,
        universalIdentifier: uuidv4(),
        applicationId,
      };
    });

    await this.coreWorkflowVersionRepository.upsert(workspaceId, coreRows, [
      'id',
    ]);

    await this.writeBackCoreVersionIds(
      workspaceId,
      coreVersionIdByWorkspaceRecordId,
    );

    await this.invalidateAutomatedTriggerMaps(workspaceId);
  }

  async deleteFromCore(
    workspaceId: string,
    coreWorkflowVersionIds: string[],
  ): Promise<void> {
    if (coreWorkflowVersionIds.length === 0) {
      return;
    }

    await this.coreWorkflowVersionRepository.delete(workspaceId, {
      id: In(coreWorkflowVersionIds),
    });

    await this.invalidateAutomatedTriggerMaps(workspaceId);
  }

  private async writeBackCoreVersionIds(
    workspaceId: string,
    coreVersionIdByWorkspaceRecordId: Map<string, string>,
  ): Promise<void> {
    if (coreVersionIdByWorkspaceRecordId.size === 0) {
      return;
    }

    if (!(await this.workspaceHasCoreWorkflowVersionIdField(workspaceId))) {
      this.logger.warn(
        `workflowVersion.coreWorkflowVersionId field missing for workspace ${workspaceId}, skipping core id write-back`,
      );

      return;
    }

    await this.globalWorkspaceOrmManager.executeInWorkspaceContext(async () => {
      const workspaceWorkflowVersionRepository =
        await this.globalWorkspaceOrmManager.getRepository<WorkflowVersionWorkspaceEntity>(
          workspaceId,
          'workflowVersion',
          { shouldBypassPermissionChecks: true },
        );

      for (const [
        workspaceRecordId,
        coreWorkflowVersionId,
      ] of coreVersionIdByWorkspaceRecordId) {
        await workspaceWorkflowVersionRepository.update(workspaceRecordId, {
          coreWorkflowVersionId,
        });
      }
    }, buildSystemAuthContext(workspaceId));
  }

  private async workspaceHasCoreWorkflowVersionIdField(
    workspaceId: string,
  ): Promise<boolean> {
    const { flatFieldMetadataMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatFieldMetadataMaps',
      ]);

    return isDefined(
      flatFieldMetadataMaps.byUniversalIdentifier[
        STANDARD_OBJECTS.workflowVersion.fields.coreWorkflowVersionId
          .universalIdentifier
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

  private async invalidateAutomatedTriggerMaps(
    workspaceId: string,
  ): Promise<void> {
    await this.workspaceCacheService.invalidateAndRecompute(workspaceId, [
      'workflowAutomatedTriggerMaps',
    ]);
  }
}
