import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { isNonEmptyString } from '@sniptt/guards';
import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { isDefined } from 'twenty-shared/utils';
import { In, Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';

import { WorkflowEntity } from 'src/engine/core-modules/workflow/entities/workflow.entity';
import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import {
  CoreWorkflowMetadataException,
  CoreWorkflowMetadataExceptionCode,
} from 'src/engine/core-modules/workflow/exceptions/core-workflow-metadata.exception';
import { CoreWorkflowMigrationWriteService } from 'src/engine/core-modules/workflow/services/core-workflow-migration-write.service';
import { type UniversalFlatWorkflow } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-workflow.type';
import { WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.service';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { WorkspaceOrmManager } from 'src/engine/twenty-orm/workspace-orm.manager';
import { InjectWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/inject-workspace-scoped-repository.decorator';
import { WorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/workspace-scoped-repository';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { type WorkflowVersionWorkspaceEntity } from 'src/modules/workflow/common/standard-objects/workflow-version.workspace-entity';
import { type WorkflowWorkspaceEntity } from 'src/modules/workflow/common/standard-objects/workflow.workspace-entity';

@Injectable()
export class WorkflowCoreSyncService {
  private readonly logger = new Logger(WorkflowCoreSyncService.name);

  constructor(
    @InjectWorkspaceScopedRepository(WorkflowEntity)
    private readonly coreWorkflowRepository: WorkspaceScopedRepository<WorkflowEntity>,
    @InjectRepository(WorkspaceEntity)
    private readonly workspaceRepository: Repository<WorkspaceEntity>,
    private readonly workspaceOrmManager: WorkspaceOrmManager,
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly coreWorkflowMigrationWriteService: CoreWorkflowMigrationWriteService,
    private readonly applicationService: ApplicationService,
    private readonly flatEntityMapsCacheService: WorkspaceManyOrAllFlatEntityMapsCacheService,
  ) {}

  async upsertToCore(
    workspaceId: string,
    workflows: WorkflowWorkspaceEntity[],
  ): Promise<void> {
    const liveWorkflows = workflows.filter(
      (workflow) => !isDefined(workflow.deletedAt),
    );

    if (liveWorkflows.length === 0) {
      return;
    }

    const applicationId = await this.getCustomApplicationIdOrThrow(workspaceId);

    const { workspaceCustomFlatApplication } =
      await this.applicationService.findWorkspaceTwentyStandardAndCustomApplicationOrThrow(
        { workspaceId },
      );

    const workspaceWorkflowIdByOwnedCoreWorkflowId =
      await this.resolveWorkspaceWorkflowIdByOwnedCoreWorkflowId(
        workspaceId,
        liveWorkflows,
      );

    const coreVersionIdByWorkspaceVersionId =
      await this.resolveCoreVersionIdByWorkspaceVersionId(
        workspaceId,
        liveWorkflows,
      );

    const coreWorkflowIdByWorkspaceRecordId = new Map<string, string>();

    const coreRows = liveWorkflows.map((workflow) => {
      const candidateCoreWorkflowId = workflow.coreWorkflowId;

      const linkedCoreWorkflowId =
        isNonEmptyString(candidateCoreWorkflowId) &&
        workspaceWorkflowIdByOwnedCoreWorkflowId.has(candidateCoreWorkflowId)
          ? candidateCoreWorkflowId
          : null;

      const coreWorkflowId = linkedCoreWorkflowId ?? uuidv4();

      if (!isDefined(linkedCoreWorkflowId)) {
        coreWorkflowIdByWorkspaceRecordId.set(workflow.id, coreWorkflowId);
      }

      const storedWorkspaceWorkflowId = isDefined(linkedCoreWorkflowId)
        ? workspaceWorkflowIdByOwnedCoreWorkflowId.get(linkedCoreWorkflowId)
        : null;

      return {
        id: coreWorkflowId,
        name: workflow.name ?? null,
        workspaceWorkflowId: isNonEmptyString(storedWorkspaceWorkflowId)
          ? storedWorkspaceWorkflowId
          : workflow.id,
        lastPublishedVersionId: isNonEmptyString(
          workflow.lastPublishedVersionId,
        )
          ? workflow.lastPublishedVersionId
          : null,
        lastPublishedCoreWorkflowVersionId: isNonEmptyString(
          workflow.lastPublishedVersionId,
        )
          ? (coreVersionIdByWorkspaceVersionId.get(
              workflow.lastPublishedVersionId,
            ) ?? null)
          : null,
        createdAt: new Date(workflow.createdAt),
        universalIdentifier: uuidv4(),
        applicationId,
      };
    });

    const { flatWorkflowMaps } =
      await this.flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        { workspaceId, flatMapsKeys: ['flatWorkflowMaps'] },
      );

    const flatWorkflowsToCreate: (UniversalFlatWorkflow & { id?: string })[] =
      [];
    const flatWorkflowsToUpdate: UniversalFlatWorkflow[] = [];

    // The cache decides which rows exist, so a stale map would send a persisted
    // id down the create branch and hit the primary key. The table decides.
    const persistedCoreWorkflowIds = new Set(
      (
        await this.coreWorkflowRepository.find(workspaceId, {
          where: { id: In(coreRows.map(({ id }) => id)) },
          select: { id: true },
        })
      ).map(({ id }) => id),
    );

    for (const coreRow of coreRows) {
      const existingFlatWorkflow = persistedCoreWorkflowIds.has(coreRow.id)
        ? findFlatEntityByIdInFlatEntityMaps({
            flatEntityId: coreRow.id,
            flatEntityMaps: flatWorkflowMaps,
          })
        : undefined;

      if (
        persistedCoreWorkflowIds.has(coreRow.id) &&
        !isDefined(existingFlatWorkflow)
      ) {
        throw new CoreWorkflowMetadataException(
          `Core workflow ${coreRow.id} is persisted but missing from the flat entity maps`,
          CoreWorkflowMetadataExceptionCode.WORKFLOW_NOT_FOUND,
        );
      }

      const flatWorkflow: UniversalFlatWorkflow = {
        universalIdentifier: coreRow.universalIdentifier,
        name: coreRow.name,
        workspaceWorkflowId: coreRow.workspaceWorkflowId,
        lastPublishedVersionId: coreRow.lastPublishedVersionId,
        lastPublishedCoreWorkflowVersionId:
          coreRow.lastPublishedCoreWorkflowVersionId,
        applicationUniversalIdentifier:
          workspaceCustomFlatApplication.universalIdentifier,
        createdAt: coreRow.createdAt.toISOString(),
        updatedAt: new Date().toISOString(),
      };

      if (isDefined(existingFlatWorkflow)) {
        flatWorkflowsToUpdate.push({
          ...existingFlatWorkflow,
          ...flatWorkflow,
          universalIdentifier: existingFlatWorkflow.universalIdentifier,
          createdAt: existingFlatWorkflow.createdAt,
        });
      } else {
        flatWorkflowsToCreate.push({ ...flatWorkflow, id: coreRow.id });
      }
    }

    await this.coreWorkflowMigrationWriteService.run({
      workspaceId,
      failureMessage:
        'Multiple validation errors occurred while mirroring workflows to core',
      operations: {
        workflow: {
          flatEntityToCreate: flatWorkflowsToCreate,
          flatEntityToDelete: [],
          flatEntityToUpdate: flatWorkflowsToUpdate,
        },
      },
    });

    await this.writeBackCoreWorkflowIds(
      workspaceId,
      coreWorkflowIdByWorkspaceRecordId,
    );
  }

  private async resolveCoreVersionIdByWorkspaceVersionId(
    workspaceId: string,
    workflows: WorkflowWorkspaceEntity[],
  ): Promise<Map<string, string>> {
    const publishedVersionIds = workflows
      .map((workflow) => workflow.lastPublishedVersionId)
      .filter(isNonEmptyString);

    if (publishedVersionIds.length === 0) {
      return new Map();
    }

    return this.workspaceOrmManager.executeInWorkspaceContext(async () => {
      const workflowVersionRepository =
        this.workspaceOrmManager.getRepository<WorkflowVersionWorkspaceEntity>(
          'workflowVersion',
          { shouldBypassPermissionChecks: true },
        );

      const rows = await workflowVersionRepository.find({
        where: { id: In(publishedVersionIds) },
        select: { id: true, coreWorkflowVersionId: true },
      });

      return new Map(
        rows.flatMap((row) =>
          isNonEmptyString(row.coreWorkflowVersionId)
            ? [[row.id, row.coreWorkflowVersionId] as const]
            : [],
        ),
      );
    }, buildSystemAuthContext(workspaceId));
  }

  // coreWorkflowId is a writable column on the workspace record, so a caller
  // can point it at a core row owned by another workspace.
  private async resolveWorkspaceWorkflowIdByOwnedCoreWorkflowId(
    workspaceId: string,
    workflows: WorkflowWorkspaceEntity[],
  ): Promise<Map<string, string | null>> {
    const candidateIds = workflows
      .map((workflow) => workflow.coreWorkflowId)
      .filter(isNonEmptyString);

    if (candidateIds.length === 0) {
      return new Map();
    }

    const ownedRows = await this.coreWorkflowRepository.find(workspaceId, {
      where: { id: In(candidateIds) },
      select: { id: true, workspaceWorkflowId: true },
    });

    return new Map(
      ownedRows.map((row) => [row.id, row.workspaceWorkflowId ?? null]),
    );
  }

  async deleteFromCore(
    workspaceId: string,
    coreWorkflowIds: string[],
  ): Promise<void> {
    if (coreWorkflowIds.length === 0) {
      return;
    }

    const { flatWorkflowMaps } =
      await this.flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        { workspaceId, flatMapsKeys: ['flatWorkflowMaps'] },
      );

    const resolvedFlatWorkflows = coreWorkflowIds.map((coreWorkflowId) =>
      findFlatEntityByIdInFlatEntityMaps({
        flatEntityId: coreWorkflowId,
        flatEntityMaps: flatWorkflowMaps,
      }),
    );

    const missingCoreWorkflowIds = coreWorkflowIds.filter(
      (_, index) => !isDefined(resolvedFlatWorkflows[index]),
    );

    // The dual-write listener deletes the same rows when the workspace mirror is
    // soft-deleted, so an id that is gone from both the cache and the table is an
    // idempotent no-op. An id still in the table is a stale cache and must fail
    // rather than leave an orphan that still reads and still broadcasts.
    if (missingCoreWorkflowIds.length > 0) {
      const stillPersisted = await this.coreWorkflowRepository.find(
        workspaceId,
        { where: { id: In(missingCoreWorkflowIds) }, select: { id: true } },
      );

      if (stillPersisted.length > 0) {
        throw new CoreWorkflowMetadataException(
          `Core workflows ${stillPersisted.map(({ id }) => id).join(', ')} are persisted but missing from the flat entity maps`,
          CoreWorkflowMetadataExceptionCode.WORKFLOW_NOT_FOUND,
        );
      }
    }

    const flatWorkflowsToDelete = resolvedFlatWorkflows.filter(isDefined);

    if (flatWorkflowsToDelete.length === 0) {
      return;
    }

    await this.coreWorkflowMigrationWriteService.run({
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

    await this.workspaceOrmManager.executeInWorkspaceContext(async () => {
      const workspaceWorkflowRepository =
        this.workspaceOrmManager.getRepository<WorkflowWorkspaceEntity>(
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
