import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { isDefined } from 'twenty-shared/utils';
import { In, Repository } from 'typeorm';

import { WorkflowEntity } from 'src/engine/core-modules/workflow/entities/workflow.entity';
import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { CacheLockService } from 'src/engine/core-modules/cache-lock/cache-lock.service';
import { WorkflowVersionCoreSyncService } from 'src/engine/core-modules/workflow/services/workflow-version-core-sync.service';
import {
  CoreWorkflowMetadataException,
  CoreWorkflowMetadataExceptionCode,
} from 'src/engine/core-modules/workflow/exceptions/core-workflow-metadata.exception';
import { type AllFlatEntityOperationByMetadataName } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-to-create-delete-update.type';
import { WorkspaceMigrationBuilderException } from 'src/engine/workspace-manager/workspace-migration/exceptions/workspace-migration-builder-exception';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';
import { WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.service';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { InjectWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/inject-workspace-scoped-repository.decorator';
import { WorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/workspace-scoped-repository';

const CORE_WORKFLOW_DELETION_LOCK_TTL_MS = 30_000;
const CORE_WORKFLOW_DELETION_LOCK_RETRY_INTERVAL_MS = 100;

@Injectable()
export class WorkflowCoreSyncService {
  constructor(
    @InjectWorkspaceScopedRepository(WorkflowEntity)
    private readonly coreWorkflowRepository: WorkspaceScopedRepository<WorkflowEntity>,
    @InjectRepository(WorkspaceEntity)
    private readonly workspaceRepository: Repository<WorkspaceEntity>,
    private readonly workspaceMigrationValidateBuildAndRunService: WorkspaceMigrationValidateBuildAndRunService,
    private readonly applicationService: ApplicationService,
    private readonly flatEntityMapsCacheService: WorkspaceManyOrAllFlatEntityMapsCacheService,
    private readonly cacheLockService: CacheLockService,
    private readonly workflowVersionCoreSyncService: WorkflowVersionCoreSyncService,
  ) {}

  private async runCoreWorkflowMigration({
    workspaceId,
    failureMessage,
    operations,
  }: {
    workspaceId: string;
    failureMessage: string;
    operations: AllFlatEntityOperationByMetadataName;
  }): Promise<void> {
    const { workspaceCustomFlatApplication } =
      await this.applicationService.findWorkspaceTwentyStandardAndCustomApplicationOrThrow(
        { workspaceId },
      );

    const validateAndBuildResult =
      await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunWorkspaceMigration(
        {
          allFlatEntityOperationByMetadataName: operations,
          workspaceId,
          isSystemBuild: false,
          applicationUniversalIdentifier:
            workspaceCustomFlatApplication.universalIdentifier,
        },
      );

    if (validateAndBuildResult.status === 'fail') {
      throw new WorkspaceMigrationBuilderException(
        validateAndBuildResult,
        failureMessage,
      );
    }
  }

  async deleteFromCore(
    workspaceId: string,
    coreWorkflowIds: string[],
  ): Promise<void> {
    if (coreWorkflowIds.length === 0) {
      return;
    }

    await this.cacheLockService.withLock(
      () => this.deleteFromCoreUnderLock(workspaceId, coreWorkflowIds),
      `core-workflow-deletion:${workspaceId}`,
      {
        ttl: CORE_WORKFLOW_DELETION_LOCK_TTL_MS,
        maxRetries:
          CORE_WORKFLOW_DELETION_LOCK_TTL_MS /
          CORE_WORKFLOW_DELETION_LOCK_RETRY_INTERVAL_MS,
        ms: CORE_WORKFLOW_DELETION_LOCK_RETRY_INTERVAL_MS,
      },
    );
  }

  private async deleteFromCoreUnderLock(
    workspaceId: string,
    coreWorkflowIds: string[],
  ): Promise<void> {
    const persistedCoreWorkflowIds = (
      await this.coreWorkflowRepository.find(workspaceId, {
        where: { id: In(coreWorkflowIds) },
        select: { id: true },
      })
    ).map(({ id }) => id);

    if (persistedCoreWorkflowIds.length === 0) {
      return;
    }

    const { flatWorkflowMaps } =
      await this.flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        { workspaceId, flatMapsKeys: ['flatWorkflowMaps'] },
      );

    const resolvedFlatWorkflows = persistedCoreWorkflowIds.map(
      (coreWorkflowId) =>
        findFlatEntityByIdInFlatEntityMaps({
          flatEntityId: coreWorkflowId,
          flatEntityMaps: flatWorkflowMaps,
        }),
    );

    const unresolvedCoreWorkflowIds = persistedCoreWorkflowIds.filter(
      (_, index) => !isDefined(resolvedFlatWorkflows[index]),
    );

    // still persisted but missing from the maps means a stale cache, so fail rather than orphan it
    if (unresolvedCoreWorkflowIds.length > 0) {
      throw new CoreWorkflowMetadataException(
        `Core workflows ${unresolvedCoreWorkflowIds.join(', ')} are persisted but missing from the flat entity maps`,
        CoreWorkflowMetadataExceptionCode.WORKFLOW_NOT_FOUND,
      );
    }

    const flatWorkflowsToDelete = resolvedFlatWorkflows.filter(isDefined);

    await this.runCoreWorkflowMigration({
      workspaceId,
      failureMessage:
        'Multiple validation errors occurred while deleting workflows',
      operations: {
        workflow: {
          flatEntityToCreate: [],
          flatEntityToDelete: flatWorkflowsToDelete,
          flatEntityToUpdate: [],
        },
      },
    });

    await this.workflowVersionCoreSyncService.invalidateAutomatedTriggerMaps(
      workspaceId,
    );
  }

  async findCoreWorkflowById(
    workspaceId: string,
    coreWorkflowId: string,
  ): Promise<WorkflowEntity | null> {
    return this.coreWorkflowRepository.findOne(workspaceId, {
      where: { id: coreWorkflowId },
    });
  }

  async findCoreWorkflowByIdOrWorkspaceWorkflowId(
    workspaceId: string,
    workflowId: string,
  ): Promise<WorkflowEntity | null> {
    const workflows = await this.coreWorkflowRepository.find(workspaceId, {
      where: [{ id: workflowId }, { workspaceWorkflowId: workflowId }],
    });

    if (workflows.length > 1) {
      throw new Error(
        `Ambiguous core workflow mapping for ${workflowId} in workspace ${workspaceId}`,
      );
    }

    return workflows[0] ?? null;
  }

  async getCustomApplicationIdOrThrow(workspaceId: string): Promise<string> {
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
