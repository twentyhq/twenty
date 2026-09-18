import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { isNonEmptyString } from '@sniptt/guards';
import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';
import { In, Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';

import {
  WorkflowVersionEntity,
  WorkflowVersionStatus,
} from 'src/engine/core-modules/workflow/entities/workflow-version.entity';
import { RecordPositionService } from 'src/engine/core-modules/record-position/services/record-position.service';
import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { CoreWorkflowMigrationWriteService } from 'src/engine/core-modules/workflow/services/core-workflow-migration-write.service';
import { WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.service';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { type FlatWorkflowVersion } from 'src/engine/metadata-modules/flat-workflow-version/types/flat-workflow-version.type';
import { CoreWorkflowEventService } from 'src/engine/core-modules/workflow/services/core-workflow-event.service';
import { resolveCoreWorkflowIdsByWorkspaceWorkflowId } from 'src/engine/core-modules/workflow/utils/resolve-core-workflow-ids-by-workspace-workflow-id.util';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { WorkspaceOrmManager } from 'src/engine/twenty-orm/workspace-orm.manager';
import { type WorkspaceTransactionScope } from 'src/engine/twenty-orm/types/workspace-transaction-scope.type';
import { WorkspaceRepository } from 'src/engine/twenty-orm/repository/workspace-repository';
import { InjectWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/inject-workspace-scoped-repository.decorator';
import { WorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/workspace-scoped-repository';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { type WorkflowVersionWorkspaceEntity } from 'src/modules/workflow/common/standard-objects/workflow-version.workspace-entity';
import { type WorkflowWorkspaceEntity } from 'src/modules/workflow/common/standard-objects/workflow.workspace-entity';
import { WorkflowMetadataReadService } from 'src/modules/workflow/common/workspace-services/workflow-metadata-read.workspace-service';
import { assertWorkflowVersionIsNotMalformedOrThrow } from 'src/modules/workflow/workflow-builder/workflow-validation/utils/assert-workflow-version-is-not-malformed-or-throw.util';

@Injectable()
export class WorkflowVersionCoreSyncService {
  private readonly logger = new Logger(WorkflowVersionCoreSyncService.name);

  constructor(
    @InjectWorkspaceScopedRepository(WorkflowVersionEntity)
    private readonly coreWorkflowVersionRepository: WorkspaceScopedRepository<WorkflowVersionEntity>,
    @InjectRepository(WorkspaceEntity)
    private readonly workspaceRepository: Repository<WorkspaceEntity>,
    private readonly workspaceOrmManager: WorkspaceOrmManager,
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly recordPositionService: RecordPositionService,
    private readonly workflowMetadataReadService: WorkflowMetadataReadService,
    private readonly coreWorkflowEventService: CoreWorkflowEventService,
    private readonly coreWorkflowMigrationWriteService: CoreWorkflowMigrationWriteService,
    private readonly flatEntityMapsCacheService: WorkspaceManyOrAllFlatEntityMapsCacheService,
    private readonly applicationService: ApplicationService,
  ) {}

  async upsertToCore(
    workspaceId: string,
    workflowVersions: WorkflowVersionWorkspaceEntity[],
  ): Promise<void> {
    if (workflowVersions.length === 0) {
      return;
    }

    const applicationId = await this.getCustomApplicationIdOrThrow(workspaceId);

    const coreWorkflowIdByWorkflowId =
      await this.resolveCoreWorkflowIdByWorkflowId(
        workspaceId,
        workflowVersions.map((workflowVersion) => workflowVersion.workflowId),
      );

    const ownedCoreVersions = await this.resolveOwnedCoreVersions(
      workspaceId,
      workflowVersions,
    );

    const coreVersionIdByWorkspaceRecordId = new Map<string, string>();

    const coreRows = workflowVersions.map((workflowVersion) => {
      const candidateCoreVersionId = workflowVersion.coreWorkflowVersionId;

      const linkedCoreVersionId =
        isNonEmptyString(candidateCoreVersionId) &&
        ownedCoreVersions.has(candidateCoreVersionId)
          ? candidateCoreVersionId
          : null;

      const coreWorkflowVersionId = linkedCoreVersionId ?? uuidv4();

      if (!isDefined(linkedCoreVersionId)) {
        coreVersionIdByWorkspaceRecordId.set(
          workflowVersion.id,
          coreWorkflowVersionId,
        );
      }

      const resolvedCoreWorkflowId =
        coreWorkflowIdByWorkflowId.get(workflowVersion.workflowId) ??
        (isDefined(linkedCoreVersionId)
          ? (ownedCoreVersions.get(linkedCoreVersionId) ?? null)
          : null);

      return {
        id: coreWorkflowVersionId,
        workflowId: workflowVersion.workflowId,
        coreWorkflowId: resolvedCoreWorkflowId,
        triggers: isDefined(workflowVersion.trigger)
          ? [workflowVersion.trigger]
          : null,
        steps: workflowVersion.steps ?? null,
        status: workflowVersion.status as unknown as WorkflowVersionStatus,
        workspaceWorkflowVersionId: workflowVersion.id,
        universalIdentifier: uuidv4(),
        applicationId,
      };
    });

    const { workspaceCustomFlatApplication } =
      await this.applicationService.findWorkspaceTwentyStandardAndCustomApplicationOrThrow(
        { workspaceId },
      );

    const { flatWorkflowVersionMaps } =
      await this.flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        { workspaceId, flatMapsKeys: ['flatWorkflowVersionMaps'] },
      );

    const flatWorkflowVersionsToCreate: FlatWorkflowVersion[] = [];
    const flatWorkflowVersionsToUpdate: FlatWorkflowVersion[] = [];

    const timestamp = new Date().toISOString();

    for (const coreRow of coreRows) {
      const existingFlatWorkflowVersion = findFlatEntityByIdInFlatEntityMaps({
        flatEntityId: coreRow.id,
        flatEntityMaps: flatWorkflowVersionMaps,
      });

      const flatWorkflowVersion = {
        ...coreRow,
        applicationUniversalIdentifier:
          workspaceCustomFlatApplication.universalIdentifier,
        createdAt: timestamp,
        updatedAt: timestamp,
      } as unknown as FlatWorkflowVersion;

      if (isDefined(existingFlatWorkflowVersion)) {
        flatWorkflowVersionsToUpdate.push({
          ...existingFlatWorkflowVersion,
          ...flatWorkflowVersion,
          createdAt: existingFlatWorkflowVersion.createdAt,
        });
      } else {
        flatWorkflowVersionsToCreate.push(flatWorkflowVersion);
      }
    }

    await this.coreWorkflowMigrationWriteService.run({
      workspaceId,
      failureMessage:
        'Multiple validation errors occurred while mirroring workflow versions to core',
      operations: {
        workflowVersion: {
          flatEntityToCreate: flatWorkflowVersionsToCreate,
          flatEntityToDelete: [],
          flatEntityToUpdate: flatWorkflowVersionsToUpdate,
        },
      },
    });

    await this.writeBackCoreVersionIds(
      workspaceId,
      coreVersionIdByWorkspaceRecordId,
    );

    await this.invalidateAutomatedTriggerMaps(workspaceId);
  }

  // Same caller-writable column as coreWorkflowId, see WorkflowCoreSyncService.
  private async resolveOwnedCoreVersions(
    workspaceId: string,
    workflowVersions: WorkflowVersionWorkspaceEntity[],
  ): Promise<Map<string, string | null>> {
    const candidateIds = workflowVersions
      .map((workflowVersion) => workflowVersion.coreWorkflowVersionId)
      .filter(isNonEmptyString);

    if (candidateIds.length === 0) {
      return new Map();
    }

    const ownedRows = await this.coreWorkflowVersionRepository.find(
      workspaceId,
      {
        where: { id: In(candidateIds) },
        select: { id: true, coreWorkflowId: true },
      },
    );

    return new Map(
      ownedRows.map((row) => [row.id, row.coreWorkflowId ?? null]),
    );
  }

  async deleteFromCore(
    workspaceId: string,
    coreWorkflowVersionIds: string[],
  ): Promise<void> {
    if (coreWorkflowVersionIds.length === 0) {
      return;
    }

    await this.deleteCoreVersionsThroughMigration(
      workspaceId,
      coreWorkflowVersionIds,
    );

    await this.invalidateAutomatedTriggerMaps(workspaceId);
  }

  private async deleteCoreVersionsThroughMigration(
    workspaceId: string,
    coreWorkflowVersionIds: string[],
  ): Promise<void> {
    if (coreWorkflowVersionIds.length === 0) {
      return;
    }

    const { flatWorkflowVersionMaps } =
      await this.flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        { workspaceId, flatMapsKeys: ['flatWorkflowVersionMaps'] },
      );

    const flatWorkflowVersionsToDelete = coreWorkflowVersionIds
      .map((coreWorkflowVersionId) =>
        findFlatEntityByIdInFlatEntityMaps({
          flatEntityId: coreWorkflowVersionId,
          flatEntityMaps: flatWorkflowVersionMaps,
        }),
      )
      .filter(isDefined);

    if (flatWorkflowVersionsToDelete.length === 0) {
      return;
    }

    await this.coreWorkflowMigrationWriteService.run({
      workspaceId,
      failureMessage:
        'Multiple validation errors occurred while deleting workflow versions',
      operations: {
        workflowVersion: {
          flatEntityToCreate: [],
          flatEntityToDelete: flatWorkflowVersionsToDelete,
          flatEntityToUpdate: [],
        },
      },
    });
  }

  async findCoreVersionById(
    workspaceId: string,
    coreWorkflowVersionId: string,
  ): Promise<WorkflowVersionEntity | null> {
    return this.coreWorkflowVersionRepository.findOne(workspaceId, {
      where: { id: coreWorkflowVersionId },
    });
  }

  async mirrorWorkflowVersionWrite({
    workspaceId,
    transactionScope,
    workflowVersion,
    applicationId,
  }: {
    workspaceId: string;
    transactionScope: WorkspaceTransactionScope;
    workflowVersion: WorkflowVersionWorkspaceEntity;
    applicationId?: string;
  }): Promise<{ coreWorkflowVersionId: string } | null> {
    if (!(await this.workspaceHasCoreWorkflowVersionIdField(workspaceId))) {
      this.logger.warn(
        `workflowVersion.coreWorkflowVersionId field missing for workspace ${workspaceId}, skipping transactional core mirror`,
      );

      return null;
    }

    const resolvedApplicationId =
      applicationId ?? (await this.getCustomApplicationIdOrThrow(workspaceId));

    const candidateCoreVersionId = workflowVersion.coreWorkflowVersionId;

    const linkedCoreVersionId =
      isNonEmptyString(candidateCoreVersionId) &&
      (await this.isCoreVersionOwnedByWorkspace({
        coreWorkflowVersionId: candidateCoreVersionId,
        workspaceId,
        transactionScope,
      }))
        ? candidateCoreVersionId
        : null;

    const isNewLink = !isDefined(linkedCoreVersionId);
    const coreWorkflowVersionId = linkedCoreVersionId ?? uuidv4();

    const coreWorkflowId = await this.resolveCoreWorkflowIdInTransaction({
      workspaceId,
      workflowId: workflowVersion.workflowId,
      transactionScope,
    });

    // The conflict target is the primary key alone, so without the workspaceId
    // predicate a core row owned by another workspace would have its triggers
    // and steps overwritten.
    await transactionScope.executeRawQuery(
      `INSERT INTO core."workflowVersion"
         ("id", "workspaceId", "workflowId", "triggers", "steps", "status", "universalIdentifier", "applicationId", "coreWorkflowId", "workspaceWorkflowVersionId")
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       ON CONFLICT ("id") DO UPDATE SET
         "triggers" = EXCLUDED."triggers",
         "steps" = EXCLUDED."steps",
         "status" = EXCLUDED."status",
         "coreWorkflowId" = COALESCE(EXCLUDED."coreWorkflowId", core."workflowVersion"."coreWorkflowId"),
         "workspaceWorkflowVersionId" = EXCLUDED."workspaceWorkflowVersionId"
       WHERE core."workflowVersion"."workspaceId" = EXCLUDED."workspaceId"`,
      [
        coreWorkflowVersionId,
        workspaceId,
        workflowVersion.workflowId,
        isDefined(workflowVersion.trigger)
          ? JSON.stringify([workflowVersion.trigger])
          : null,
        isDefined(workflowVersion.steps)
          ? JSON.stringify(workflowVersion.steps)
          : null,
        workflowVersion.status,
        uuidv4(),
        resolvedApplicationId,
        coreWorkflowId,
        workflowVersion.id,
      ],
    );

    if (isNewLink) {
      await this.writeBackCoreVersionIdInTransaction(
        workflowVersion.id,
        coreWorkflowVersionId,
        transactionScope,
      );
    }

    transactionScope.afterCommit(() => {
      void this.flatEntityMapsCacheService
        .invalidateFlatEntityMaps({
          workspaceId,
          flatMapsKeys: ['flatWorkflowVersionMaps'],
        })
        .catch(() => undefined);
    });

    if (isDefined(coreWorkflowId)) {
      this.coreWorkflowEventService.publishWorkflowEventsAfterCommit({
        workspaceId,
        transactionScope,
        events: [
          {
            operation: isNewLink ? 'created' : 'updated',
            coreWorkflowId,
            coreWorkflowVersionId,
          },
        ],
      });
    }

    return { coreWorkflowVersionId };
  }

  private async resolveCoreWorkflowIdByWorkflowId(
    workspaceId: string,
    workflowIds: string[],
  ): Promise<Map<string, string>> {
    const distinctWorkflowIds = [...new Set(workflowIds)];

    if (distinctWorkflowIds.length === 0) {
      return new Map();
    }

    const workflows = await this.workspaceOrmManager.executeInWorkspaceContext(
      async () => {
        const workflowRepository =
          this.workspaceOrmManager.getRepository<WorkflowWorkspaceEntity>(
            'workflow',
            { shouldBypassPermissionChecks: true },
          );

        return workflowRepository.find({
          where: { id: In(distinctWorkflowIds) },
          withDeleted: true,
        });
      },
      buildSystemAuthContext(workspaceId),
    );

    const coreWorkflowIdByWorkflowId = new Map<string, string>();

    for (const workflow of workflows) {
      if (isNonEmptyString(workflow.coreWorkflowId)) {
        coreWorkflowIdByWorkflowId.set(workflow.id, workflow.coreWorkflowId);
      }
    }

    const unresolvedWorkflowIds = distinctWorkflowIds.filter(
      (candidateWorkflowId) =>
        !coreWorkflowIdByWorkflowId.has(candidateWorkflowId),
    );

    const reverseMappedCoreWorkflowIds =
      await resolveCoreWorkflowIdsByWorkspaceWorkflowId({
        executeQuery: (query, parameters) =>
          this.workspaceRepository.manager.query(query, parameters),
        workspaceId,
        workspaceWorkflowIds: unresolvedWorkflowIds,
      });

    for (const [
      workspaceWorkflowId,
      coreWorkflowId,
    ] of reverseMappedCoreWorkflowIds) {
      if (!coreWorkflowIdByWorkflowId.has(workspaceWorkflowId)) {
        coreWorkflowIdByWorkflowId.set(workspaceWorkflowId, coreWorkflowId);
      }
    }

    return coreWorkflowIdByWorkflowId;
  }

  private async resolveCoreWorkflowIdInTransaction({
    workspaceId,
    workflowId,
    transactionScope,
  }: {
    workspaceId: string;
    workflowId: string;
    transactionScope: WorkspaceTransactionScope;
  }): Promise<string | null> {
    const workflow = await transactionScope
      .getRepository<WorkflowWorkspaceEntity>('workflow', {
        shouldBypassPermissionChecks: true,
      })
      .findOne({ where: { id: workflowId }, withDeleted: true });

    const pointedCoreWorkflowId = workflow?.coreWorkflowId ?? null;

    if (isNonEmptyString(pointedCoreWorkflowId)) {
      return pointedCoreWorkflowId;
    }

    const coreWorkflowIdByWorkspaceWorkflowId =
      await resolveCoreWorkflowIdsByWorkspaceWorkflowId({
        executeQuery: (query, parameters) =>
          transactionScope.executeRawQuery(query, parameters),
        workspaceId,
        workspaceWorkflowIds: [workflowId],
      });

    return coreWorkflowIdByWorkspaceWorkflowId.get(workflowId) ?? null;
  }

  // Must run inside the caller's transaction so the ownership answer cannot go
  // stale before the insert below uses it.
  private async isCoreVersionOwnedByWorkspace({
    coreWorkflowVersionId,
    workspaceId,
    transactionScope,
  }: {
    coreWorkflowVersionId: string;
    workspaceId: string;
    transactionScope: WorkspaceTransactionScope;
  }): Promise<boolean> {
    const rows = await transactionScope.executeRawQuery(
      `SELECT 1 FROM core."workflowVersion" WHERE "id" = $1 AND "workspaceId" = $2`,
      [coreWorkflowVersionId, workspaceId],
    );

    return isNonEmptyArray(rows);
  }

  async mirrorWorkflowVersionWrites({
    workspaceId,
    transactionScope,
    workflowVersions,
  }: {
    workspaceId: string;
    transactionScope: WorkspaceTransactionScope;
    workflowVersions: WorkflowVersionWorkspaceEntity[];
  }): Promise<Map<string, string>> {
    const coreIdByWorkspaceRecordId = new Map<string, string>();

    if (workflowVersions.length === 0) {
      return coreIdByWorkspaceRecordId;
    }

    const applicationId = await this.getCustomApplicationIdOrThrow(workspaceId);

    for (const workflowVersion of workflowVersions) {
      const result = await this.mirrorWorkflowVersionWrite({
        workspaceId,
        transactionScope,
        workflowVersion,
        applicationId,
      });

      if (isDefined(result)) {
        coreIdByWorkspaceRecordId.set(
          workflowVersion.id,
          result.coreWorkflowVersionId,
        );
      }
    }

    return coreIdByWorkspaceRecordId;
  }

  async createInitialDraftVersionForWorkflow(
    workspaceId: string,
    workflowId: string,
  ): Promise<void> {
    await this.writeWorkflowVersionAndMirror(
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

        const insertResult = await workflowVersionRepository.insert({
          workflowId,
          status: WorkflowVersionStatus.DRAFT,
          name: 'v1',
          position,
        });

        return (insertResult.generatedMaps[0] as WorkflowVersionWorkspaceEntity)
          .id;
      },
    );
  }

  async writeWorkflowVersionAndMirror(
    workspaceId: string,
    write: (
      workflowVersionRepository: WorkspaceRepository<WorkflowVersionWorkspaceEntity>,
      transactionScope: WorkspaceTransactionScope,
    ) => Promise<string>,
  ): Promise<void> {
    await this.workspaceOrmManager.executeInWorkspaceContext(async () => {
      await this.workspaceOrmManager.runInWorkspaceTransaction(
        async (transactionScope) => {
          const workflowVersionRepository =
            transactionScope.getRepository<WorkflowVersionWorkspaceEntity>(
              'workflowVersion',
              { shouldBypassPermissionChecks: true },
            );

          const workflowVersionId = await write(
            workflowVersionRepository,
            transactionScope,
          );

          const workflowVersion = await workflowVersionRepository.findOne({
            where: { id: workflowVersionId },
          });

          if (isDefined(workflowVersion)) {
            const {
              flatObjectMetadataMaps,
              flatFieldMetadataMaps,
              objectIdByNameSingular,
            } =
              await this.workflowMetadataReadService.getFlatEntityMaps(
                workspaceId,
              );

            assertWorkflowVersionIsNotMalformedOrThrow({
              trigger: workflowVersion.trigger,
              steps: workflowVersion.steps,
              flatObjectMetadataMaps,
              flatFieldMetadataMaps,
              objectIdByNameSingular,
            });

            await this.mirrorWorkflowVersionWrite({
              workspaceId,
              transactionScope,
              workflowVersion,
            });
          }
        },
      );
    }, buildSystemAuthContext(workspaceId));

    await this.invalidateAutomatedTriggerMaps(workspaceId);
  }

  async deleteCoreVersionsByWorkflowIds(
    workspaceId: string,
    workflowIds: string[],
  ): Promise<void> {
    if (workflowIds.length === 0) {
      return;
    }

    const versionsToDelete = await this.coreWorkflowVersionRepository.find(
      workspaceId,
      {
        where: { workflowId: In(workflowIds) },
        select: { id: true },
      },
    );

    await this.deleteCoreVersionsThroughMigration(
      workspaceId,
      versionsToDelete.map((version) => version.id),
    );

    await this.invalidateAutomatedTriggerMaps(workspaceId);
  }

  async deleteCoreVersionsByWorkspaceVersionIds(
    workspaceId: string,
    workflowVersionIds: string[],
  ): Promise<void> {
    if (workflowVersionIds.length === 0) {
      return;
    }

    const coreWorkflowVersionIds =
      await this.workspaceOrmManager.executeInWorkspaceContext(async () => {
        const workflowVersionRepository =
          this.workspaceOrmManager.getRepository<WorkflowVersionWorkspaceEntity>(
            'workflowVersion',
            { shouldBypassPermissionChecks: true },
          );

        const versions = await workflowVersionRepository.find({
          where: { id: In(workflowVersionIds) },
          withDeleted: true,
        });

        return versions
          .map((version) => version.coreWorkflowVersionId)
          .filter(isNonEmptyString);
      }, buildSystemAuthContext(workspaceId));

    await this.deleteFromCore(workspaceId, coreWorkflowVersionIds);
  }

  async recreateCoreVersionsByWorkflowId(
    workspaceId: string,
    workflowId: string,
  ): Promise<void> {
    await this.workspaceOrmManager.executeInWorkspaceContext(async () => {
      const workflowVersionRepository =
        this.workspaceOrmManager.getRepository<WorkflowVersionWorkspaceEntity>(
          'workflowVersion',
          { shouldBypassPermissionChecks: true },
        );

      const versions = await workflowVersionRepository.find({
        where: { workflowId },
      });

      await this.upsertToCore(workspaceId, versions);
    }, buildSystemAuthContext(workspaceId));
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

    await this.workspaceOrmManager.executeInWorkspaceContext(async () => {
      const workspaceWorkflowVersionRepository =
        this.workspaceOrmManager.getRepository<WorkflowVersionWorkspaceEntity>(
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

  private async writeBackCoreVersionIdInTransaction(
    workflowVersionId: string,
    coreWorkflowVersionId: string,
    transactionScope: WorkspaceTransactionScope,
  ): Promise<void> {
    const workspaceWorkflowVersionRepository =
      transactionScope.getRepository<WorkflowVersionWorkspaceEntity>(
        'workflowVersion',
        { shouldBypassPermissionChecks: true },
      );

    await workspaceWorkflowVersionRepository.update(
      { id: workflowVersionId },
      { coreWorkflowVersionId },
    );
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

  async invalidateAutomatedTriggerMaps(workspaceId: string): Promise<void> {
    await this.workspaceCacheService.invalidateAndRecompute(workspaceId, [
      'workflowAutomatedTriggerMaps',
    ]);
  }
}
