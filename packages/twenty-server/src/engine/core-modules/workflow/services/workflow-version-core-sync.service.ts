import { Injectable, Logger } from '@nestjs/common';

import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { toCoreWorkflowVersionStatus } from 'src/engine/core-modules/workflow/utils/workflow-version-status.util';
import { WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.service';
import { type AllFlatEntityOperationByMetadataName } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-to-create-delete-update.type';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { type UniversalFlatWorkflowVersion } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-workflow-version.type';
import { WorkspaceMigrationBuilderException } from 'src/engine/workspace-manager/workspace-migration/exceptions/workspace-migration-builder-exception';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';
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
import {
  CoreWorkflowMetadataException,
  CoreWorkflowMetadataExceptionCode,
} from 'src/engine/core-modules/workflow/exceptions/core-workflow-metadata.exception';
import { RecordPositionService } from 'src/engine/core-modules/record-position/services/record-position.service';
import { hasCoreWorkflowWorkspaceVersionIdColumn } from 'src/engine/core-modules/workflow/utils/has-core-workflow-workspace-version-id-column.util';
import { hasCoreWorkflowWorkspaceWorkflowIdColumn } from 'src/engine/core-modules/workflow/utils/has-core-workflow-workspace-workflow-id-column.util';
import { resolveCoreWorkflowIdsByWorkspaceWorkflowId } from 'src/engine/core-modules/workflow/utils/resolve-core-workflow-ids-by-workspace-workflow-id.util';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { WorkspaceOrmManager } from 'src/engine/twenty-orm/workspace-orm.manager';
import { type WorkspaceTransactionScope } from 'src/engine/twenty-orm/types/workspace-transaction-scope.type';
import { WorkspaceRepository } from 'src/engine/twenty-orm/repository/workspace-repository';
import { InjectWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/inject-workspace-scoped-repository.decorator';
import { WorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/workspace-scoped-repository';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { InjectCacheStorage } from 'src/engine/core-modules/cache-storage/decorators/cache-storage.decorator';
import { CacheStorageService } from 'src/engine/core-modules/cache-storage/services/cache-storage.service';
import { CacheStorageNamespace } from 'src/engine/core-modules/cache-storage/types/cache-storage-namespace.enum';
import { WORKFLOW_CRON_TRIGGER_CACHE_KEY } from 'src/modules/workflow/workflow-trigger/automated-trigger/crons/constants/workflow-cron-trigger-cache-key.constant';
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
    private readonly workspaceMigrationValidateBuildAndRunService: WorkspaceMigrationValidateBuildAndRunService,
    private readonly flatEntityMapsCacheService: WorkspaceManyOrAllFlatEntityMapsCacheService,
    private readonly applicationService: ApplicationService,
    @InjectCacheStorage(CacheStorageNamespace.ModuleWorkflow)
    private readonly cacheStorageService: CacheStorageService,
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

  async upsertToCore(
    workspaceId: string,
    workflowVersions: WorkflowVersionWorkspaceEntity[],
  ): Promise<void> {
    if (workflowVersions.length === 0) {
      return;
    }

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
        workspaceWorkflowVersionId: workflowVersion.id,
        workflowId: workflowVersion.workflowId,
        coreWorkflowId: resolvedCoreWorkflowId,
        triggers: isDefined(workflowVersion.trigger)
          ? [workflowVersion.trigger]
          : null,
        steps: workflowVersion.steps ?? null,
        status: toCoreWorkflowVersionStatus(workflowVersion.status),
        universalIdentifier: uuidv4(),
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

    // The table decides create vs update: a stale map would send a persisted id
    // down the create branch and into the primary key.
    const persistedCoreVersionIds = new Set(
      (
        await this.coreWorkflowVersionRepository.find(workspaceId, {
          where: { id: In(coreRows.map(({ id }) => id)) },
          select: { id: true },
        })
      ).map(({ id }) => id),
    );

    const timestamp = new Date().toISOString();
    const flatVersionsToCreate: (UniversalFlatWorkflowVersion & {
      id?: string;
    })[] = [];
    const flatVersionsToUpdate: UniversalFlatWorkflowVersion[] = [];

    for (const coreRow of coreRows) {
      const existingFlatWorkflowVersion = persistedCoreVersionIds.has(
        coreRow.id,
      )
        ? findFlatEntityByIdInFlatEntityMaps({
            flatEntityId: coreRow.id,
            flatEntityMaps: flatWorkflowVersionMaps,
          })
        : undefined;

      if (
        persistedCoreVersionIds.has(coreRow.id) &&
        !isDefined(existingFlatWorkflowVersion)
      ) {
        throw new CoreWorkflowMetadataException(
          `Core workflow version ${coreRow.id} is persisted but missing from the flat entity maps`,
          CoreWorkflowMetadataExceptionCode.WORKFLOW_VERSION_NOT_FOUND,
        );
      }

      const flatWorkflowVersion: UniversalFlatWorkflowVersion & {
        id: string;
      } = {
        ...coreRow,
        coreWorkflowId:
          coreRow.coreWorkflowId ??
          existingFlatWorkflowVersion?.coreWorkflowId ??
          null,
        universalIdentifier:
          existingFlatWorkflowVersion?.universalIdentifier ??
          coreRow.universalIdentifier,
        applicationUniversalIdentifier:
          workspaceCustomFlatApplication.universalIdentifier,
        createdAt: existingFlatWorkflowVersion?.createdAt ?? timestamp,
        updatedAt: timestamp,
      };

      if (isDefined(existingFlatWorkflowVersion)) {
        flatVersionsToUpdate.push(flatWorkflowVersion);
      } else {
        flatVersionsToCreate.push(flatWorkflowVersion);
      }
    }

    await this.runCoreWorkflowMigration({
      workspaceId,
      failureMessage:
        'Multiple validation errors occurred while mirroring workflow versions to core',
      operations: {
        workflowVersion: {
          flatEntityToCreate: flatVersionsToCreate,
          flatEntityToDelete: [],
          flatEntityToUpdate: flatVersionsToUpdate,
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

    const deletedVersions = await this.coreWorkflowVersionRepository.find(
      workspaceId,
      {
        where: { id: In(coreWorkflowVersionIds) },
        select: { id: true, coreWorkflowId: true, status: true },
      },
    );

    await this.deleteCoreVersionsThroughMigration({
      workspaceId,
      coreWorkflowVersionIds,
    });

    await this.invalidateAutomatedTriggerMaps(workspaceId);
    await this.evictCronTriggerCacheEntries(deletedVersions);
  }

  private async evictCronTriggerCacheEntries(
    deletedVersions: Pick<WorkflowVersionEntity, 'coreWorkflowId' | 'status'>[],
  ): Promise<void> {
    const fields = [
      ...new Set(
        deletedVersions
          .filter((version) => version.status === WorkflowVersionStatus.ACTIVE)
          .map((version) => version.coreWorkflowId)
          .filter(isNonEmptyString),
      ),
    ];

    for (const field of fields) {
      await this.cacheStorageService.hashDelete({
        key: WORKFLOW_CRON_TRIGGER_CACHE_KEY,
        field,
      });
    }
  }

  private async deleteCoreVersionsThroughMigration({
    workspaceId,
    coreWorkflowVersionIds,
  }: {
    workspaceId: string;
    coreWorkflowVersionIds: string[];
  }): Promise<void> {
    if (coreWorkflowVersionIds.length === 0) {
      return;
    }

    const { flatWorkflowVersionMaps } =
      await this.flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        { workspaceId, flatMapsKeys: ['flatWorkflowVersionMaps'] },
      );

    const resolvedFlatVersions = coreWorkflowVersionIds.map(
      (coreWorkflowVersionId) =>
        findFlatEntityByIdInFlatEntityMaps({
          flatEntityId: coreWorkflowVersionId,
          flatEntityMaps: flatWorkflowVersionMaps,
        }),
    );

    const missingCoreWorkflowVersionIds = coreWorkflowVersionIds.filter(
      (_, index) => !isDefined(resolvedFlatVersions[index]),
    );

    // The dual-write listener deletes the same ids when the mirror is soft
    // deleted, so an id gone from both the cache and the table is an idempotent
    // no-op. An id still in the table is a stale cache and must fail rather than
    // leave an orphan that still reads and still broadcasts.
    if (missingCoreWorkflowVersionIds.length > 0) {
      const stillPersisted = await this.coreWorkflowVersionRepository.find(
        workspaceId,
        {
          where: { id: In(missingCoreWorkflowVersionIds) },
          select: { id: true },
        },
      );

      if (stillPersisted.length > 0) {
        throw new CoreWorkflowMetadataException(
          `Core workflow versions ${stillPersisted.map(({ id }) => id).join(', ')} are persisted but missing from the flat entity maps`,
          CoreWorkflowMetadataExceptionCode.WORKFLOW_VERSION_NOT_FOUND,
        );
      }
    }

    const flatVersionsToDelete = resolvedFlatVersions.filter(isDefined);

    if (flatVersionsToDelete.length === 0) {
      return;
    }

    await this.runCoreWorkflowMigration({
      workspaceId,
      failureMessage:
        'Multiple validation errors occurred while deleting workflow versions',
      operations: {
        workflowVersion: {
          flatEntityToCreate: [],
          flatEntityToDelete: flatVersionsToDelete,
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

  async findCoreVersionByWorkspaceVersionId(
    workspaceId: string,
    workspaceWorkflowVersionId: string,
  ): Promise<WorkflowVersionEntity | null> {
    return this.coreWorkflowVersionRepository.findOne(workspaceId, {
      where: { workspaceWorkflowVersionId },
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

    const hasWorkspaceVersionMapping =
      await hasCoreWorkflowWorkspaceVersionIdColumn((query) =>
        transactionScope.executeRawQuery(query),
      );
    const candidateCoreVersionId = workflowVersion.coreWorkflowVersionId;
    const candidateRows = isNonEmptyString(candidateCoreVersionId)
      ? ((await transactionScope.executeRawQuery(
          `SELECT "id", "workspaceId", "workflowId"${hasWorkspaceVersionMapping ? ', "workspaceWorkflowVersionId"' : ''} FROM core."workflowVersion" WHERE id = $1 FOR UPDATE`,
          [candidateCoreVersionId],
        )) as {
          id: string;
          workspaceId: string;
          workflowId: string | null;
          workspaceWorkflowVersionId?: string | null;
        }[])
      : [];
    const candidate = candidateRows[0];

    if (
      isDefined(candidate) &&
      (candidate.workspaceId !== workspaceId ||
        candidate.workflowId !== workflowVersion.workflowId ||
        (isDefined(candidate.workspaceWorkflowVersionId) &&
          candidate.workspaceWorkflowVersionId !== workflowVersion.id))
    ) {
      throw new Error(
        `Conflicting core mapping for workflow version ${workflowVersion.id} in workspace ${workspaceId}`,
      );
    }

    const reverseRows = hasWorkspaceVersionMapping
      ? ((await transactionScope.executeRawQuery(
          `SELECT id FROM core."workflowVersion" WHERE "workspaceId" = $1 AND "workspaceWorkflowVersionId" = $2 FOR UPDATE`,
          [workspaceId, workflowVersion.id],
        )) as { id: string }[])
      : [];

    if (
      reverseRows.length > 1 ||
      (isDefined(candidate) &&
        isDefined(reverseRows[0]) &&
        reverseRows[0].id !== candidate.id)
    ) {
      throw new Error(
        `Ambiguous core mapping for workflow version ${workflowVersion.id} in workspace ${workspaceId}`,
      );
    }

    const coreWorkflowVersionId =
      reverseRows[0]?.id ?? candidateCoreVersionId ?? uuidv4();
    const isNewLink =
      workflowVersion.coreWorkflowVersionId !== coreWorkflowVersionId;

    const coreWorkflowId = await this.resolveCoreWorkflowIdInTransaction({
      workspaceId,
      workflowId: workflowVersion.workflowId,
      transactionScope,
    });

    // The conflict target is the primary key alone, so without the workspaceId
    // predicate a core row owned by another workspace would have its triggers
    // and steps overwritten.
    const mirroredRows = await transactionScope.executeRawQuery(
      `INSERT INTO core."workflowVersion"
         ("id", "workspaceId", "workflowId", "triggers", "steps", "status", "universalIdentifier", "applicationId", "coreWorkflowId"${hasWorkspaceVersionMapping ? ', "workspaceWorkflowVersionId"' : ''})
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9${hasWorkspaceVersionMapping ? ', $10' : ''})
       ON CONFLICT ("id") DO UPDATE SET
         ${hasWorkspaceVersionMapping ? '"workspaceWorkflowVersionId" = EXCLUDED."workspaceWorkflowVersionId",' : ''}
         "triggers" = EXCLUDED."triggers",
         "steps" = EXCLUDED."steps",
         "status" = EXCLUDED."status",
         "coreWorkflowId" = COALESCE(EXCLUDED."coreWorkflowId", core."workflowVersion"."coreWorkflowId")
       WHERE core."workflowVersion"."workspaceId" = EXCLUDED."workspaceId" RETURNING id`,
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
        ...(hasWorkspaceVersionMapping ? [workflowVersion.id] : []),
      ],
    );

    if (mirroredRows.length !== 1) {
      throw new Error(
        `Core workflow version ${coreWorkflowVersionId} could not be mirrored in workspace ${workspaceId}`,
      );
    }

    if (isNewLink) {
      await this.writeBackCoreVersionIdInTransaction(
        workflowVersion.id,
        coreWorkflowVersionId,
        transactionScope,
      );
    }

    // This writer stays on raw SQL because it runs inside a transaction its
    // caller owns and relies on the locks taken above, so the flat entity maps
    // have to be refreshed by hand or the next migration write diffs against a
    // cache that no longer matches the table.
    transactionScope.afterCommit(async () => {
      await this.flatEntityMapsCacheService.invalidateFlatEntityMaps({
        workspaceId,
        flatMapsKeys: ['flatWorkflowVersionMaps'],
      });
    });

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

    const isColumnAvailable = await hasCoreWorkflowWorkspaceWorkflowIdColumn(
      (query) => transactionScope.executeRawQuery(query),
    );

    if (!isColumnAvailable) {
      return pointedCoreWorkflowId;
    }

    if (isNonEmptyString(pointedCoreWorkflowId)) {
      const pointedRows = (await transactionScope.executeRawQuery(
        `SELECT "workspaceId", "workspaceWorkflowId" FROM core."workflow" WHERE id = $1 FOR UPDATE`,
        [pointedCoreWorkflowId],
      )) as { workspaceId: string; workspaceWorkflowId: string | null }[];
      const pointed = pointedRows[0];

      if (isDefined(pointed)) {
        if (
          pointed.workspaceId !== workspaceId ||
          pointed.workspaceWorkflowId !== workflowId
        ) {
          throw new Error(
            `Conflicting core mapping for workflow ${workflowId} in workspace ${workspaceId}`,
          );
        }
        return pointedCoreWorkflowId;
      }
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

    const deletedVersions = await this.coreWorkflowVersionRepository.find(
      workspaceId,
      {
        where: { workflowId: In(workflowIds) },
        select: { id: true, coreWorkflowId: true, status: true },
      },
    );

    await this.deleteCoreVersionsThroughMigration({
      workspaceId,
      coreWorkflowVersionIds: deletedVersions.map(({ id }) => id),
    });

    await this.invalidateAutomatedTriggerMaps(workspaceId);
    await this.evictCronTriggerCacheEntries(deletedVersions);
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
      await this.workspaceOrmManager.runInWorkspaceTransaction(
        async (transactionScope) => {
          const workflowVersionRepository =
            transactionScope.getRepository<WorkflowVersionWorkspaceEntity>(
              'workflowVersion',
              { shouldBypassPermissionChecks: true },
            );
          const versions = await workflowVersionRepository.find({
            where: { workflowId },
          });

          await this.mirrorWorkflowVersionWrites({
            workspaceId,
            transactionScope,
            workflowVersions: versions,
          });
        },
      );
    }, buildSystemAuthContext(workspaceId));

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
