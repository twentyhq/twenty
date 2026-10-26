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

import { WorkflowVersionEntity } from 'src/engine/core-modules/workflow/entities/workflow-version.entity';
import {
  CoreWorkflowMetadataException,
  CoreWorkflowMetadataExceptionCode,
} from 'src/engine/core-modules/workflow/exceptions/core-workflow-metadata.exception';
import { resolveCoreWorkflowIdsByWorkspaceWorkflowId } from 'src/engine/core-modules/workflow/utils/resolve-core-workflow-ids-by-workspace-workflow-id.util';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { WorkspaceOrmManager } from 'src/engine/twenty-orm/workspace-orm.manager';
import { InjectWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/inject-workspace-scoped-repository.decorator';
import { WorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/workspace-scoped-repository';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { InjectCacheStorage } from 'src/engine/core-modules/cache-storage/decorators/cache-storage.decorator';
import { CacheStorageService } from 'src/engine/core-modules/cache-storage/services/cache-storage.service';
import { CacheStorageNamespace } from 'src/engine/core-modules/cache-storage/types/cache-storage-namespace.enum';
import { type CachedCronTrigger } from 'src/modules/workflow/workflow-trigger/automated-trigger/crons/types/cached-cron-trigger.type';
import { publishCronTriggerCacheEntry } from 'src/modules/workflow/workflow-trigger/automated-trigger/crons/utils/publish-cron-trigger-cache-entry.util';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { type WorkflowVersionWorkspaceEntity } from 'src/modules/workflow/common/standard-objects/workflow-version.workspace-entity';
import { type WorkflowWorkspaceEntity } from 'src/modules/workflow/common/standard-objects/workflow.workspace-entity';

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
    applicationUniversalIdentifier,
  }: {
    workspaceId: string;
    failureMessage: string;
    operations: AllFlatEntityOperationByMetadataName;
    applicationUniversalIdentifier?: string;
  }): Promise<void> {
    const universalIdentifier =
      applicationUniversalIdentifier ??
      (
        await this.applicationService.findWorkspaceTwentyStandardAndCustomApplicationOrThrow(
          { workspaceId },
        )
      ).workspaceCustomFlatApplication.universalIdentifier;

    const validateAndBuildResult =
      await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunWorkspaceMigration(
        {
          allFlatEntityOperationByMetadataName: operations,
          workspaceId,
          isSystemBuild: false,
          applicationUniversalIdentifier: universalIdentifier,
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

    // read the table, not the cache: a stale map would send a persisted id to create and hit the primary key
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
        // Non-comparable, so an update must carry the stored values or the builder rejects it
        ...(isDefined(existingFlatWorkflowVersion)
          ? {
              workflowId: existingFlatWorkflowVersion.workflowId,
              workspaceWorkflowVersionId:
                existingFlatWorkflowVersion.workspaceWorkflowVersionId,
            }
          : {}),
        isSystemSideEffect: false,
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
      applicationUniversalIdentifier:
        workspaceCustomFlatApplication.universalIdentifier,
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

  async publishCronTriggerCacheEntries(
    cachedTriggers: CachedCronTrigger[],
  ): Promise<void> {
    for (const cachedTrigger of cachedTriggers) {
      await publishCronTriggerCacheEntry({
        cacheStorageService: this.cacheStorageService,
        cachedTrigger,
        logger: this.logger,
      });
    }
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
    const aliasedCoreVersion = await this.coreWorkflowVersionRepository.findOne(
      workspaceId,
      { where: { workspaceWorkflowVersionId } },
    );

    if (isDefined(aliasedCoreVersion)) {
      return aliasedCoreVersion;
    }

    const linkedCoreVersionId =
      await this.workspaceOrmManager.executeInWorkspaceContext(async () => {
        const workflowVersion = await this.workspaceOrmManager
          .getRepository<WorkflowVersionWorkspaceEntity>('workflowVersion', {
            shouldBypassPermissionChecks: true,
          })
          .findOne({
            where: { id: workspaceWorkflowVersionId },
            select: { coreWorkflowVersionId: true },
          });

        return workflowVersion?.coreWorkflowVersionId ?? null;
      }, buildSystemAuthContext(workspaceId));

    if (!isNonEmptyString(linkedCoreVersionId)) {
      return null;
    }

    const linkedCoreVersion = await this.coreWorkflowVersionRepository.findOne(
      workspaceId,
      { where: { id: linkedCoreVersionId } },
    );

    return isDefined(linkedCoreVersion) &&
      !isDefined(linkedCoreVersion.workspaceWorkflowVersionId)
      ? linkedCoreVersion
      : null;
  }

  async findWorkspaceVersionIdByCoreVersionId(
    workspaceId: string,
    coreWorkflowVersionId: string,
  ): Promise<string | null> {
    return this.workspaceOrmManager.executeInWorkspaceContext(async () => {
      const workflowVersion = await this.workspaceOrmManager
        .getRepository<WorkflowVersionWorkspaceEntity>('workflowVersion', {
          shouldBypassPermissionChecks: true,
        })
        .findOne({ where: { coreWorkflowVersionId }, select: { id: true } });

      return workflowVersion?.id ?? null;
    }, buildSystemAuthContext(workspaceId));
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

  async invalidateAutomatedTriggerMaps(workspaceId: string): Promise<void> {
    await this.workspaceCacheService.invalidateAndRecompute(workspaceId, [
      'workflowAutomatedTriggerMaps',
    ]);
  }
}
