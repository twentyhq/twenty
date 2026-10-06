import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';
import { In, Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';

import {
  LEGACY_WORKFLOW_VERSION_CORE_WORKFLOW_VERSION_ID_FIELD_UNIVERSAL_IDENTIFIER,
  type LegacyWorkflowVersionWorkspaceEntity,
  type LegacyWorkflowWorkspaceEntity,
} from 'src/database/commands/upgrade-version-command/utils/legacy-workflow-workspace-entity.type';
import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import {
  WorkflowVersionEntity,
  type WorkflowVersionStatus,
} from 'src/engine/core-modules/workflow/entities/workflow-version.entity';
import {
  CoreWorkflowMetadataException,
  CoreWorkflowMetadataExceptionCode,
} from 'src/engine/core-modules/workflow/exceptions/core-workflow-metadata.exception';
import { hasCoreWorkflowWorkspaceWorkflowIdColumn } from 'src/engine/core-modules/workflow/utils/has-core-workflow-workspace-workflow-id-column.util';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.service';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { WorkspaceOrmManager } from 'src/engine/twenty-orm/workspace-orm.manager';
import { InjectWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/inject-workspace-scoped-repository.decorator';
import { WorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/workspace-scoped-repository';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { WorkspaceMigrationBuilderException } from 'src/engine/workspace-manager/workspace-migration/exceptions/workspace-migration-builder-exception';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';
import { type UniversalFlatWorkflowVersion } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-workflow-version.type';

@Injectable()
export class LegacyWorkflowVersionCoreUpsertService {
  private readonly logger = new Logger(
    LegacyWorkflowVersionCoreUpsertService.name,
  );

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
  ) {}

  async upsertToCore(
    workspaceId: string,
    workflowVersions: LegacyWorkflowVersionWorkspaceEntity[],
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
        status: workflowVersion.status as WorkflowVersionStatus,
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

    const validateAndBuildResult =
      await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunWorkspaceMigration(
        {
          allFlatEntityOperationByMetadataName: {
            workflowVersion: {
              flatEntityToCreate: flatVersionsToCreate,
              flatEntityToDelete: [],
              flatEntityToUpdate: flatVersionsToUpdate,
            },
          },
          workspaceId,
          isSystemBuild: false,
          applicationUniversalIdentifier:
            workspaceCustomFlatApplication.universalIdentifier,
        },
      );

    if (validateAndBuildResult.status === 'fail') {
      throw new WorkspaceMigrationBuilderException(
        validateAndBuildResult,
        'Multiple validation errors occurred while mirroring workflow versions to core',
      );
    }

    await this.writeBackCoreVersionIds(
      workspaceId,
      coreVersionIdByWorkspaceRecordId,
    );

    await this.workspaceCacheService.invalidateAndRecompute(workspaceId, [
      'workflowAutomatedTriggerMaps',
    ]);
  }

  private async resolveOwnedCoreVersions(
    workspaceId: string,
    workflowVersions: LegacyWorkflowVersionWorkspaceEntity[],
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

  private async resolveCoreWorkflowIdByWorkflowId(
    workspaceId: string,
    workflowIds: string[],
  ): Promise<Map<string, string>> {
    const distinctWorkflowIds = [...new Set(workflowIds)];

    if (distinctWorkflowIds.length === 0) {
      return new Map();
    }

    const workflows = await this.workspaceOrmManager.executeInWorkspaceContext(
      async () =>
        this.workspaceOrmManager
          .getRepository<LegacyWorkflowWorkspaceEntity>('workflow', {
            shouldBypassPermissionChecks: true,
          })
          .find({
            where: { id: In(distinctWorkflowIds) },
            withDeleted: true,
          }),
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

    if (
      unresolvedWorkflowIds.length === 0 ||
      !(await hasCoreWorkflowWorkspaceWorkflowIdColumn((query) =>
        this.workspaceRepository.manager.query(query),
      ))
    ) {
      return coreWorkflowIdByWorkflowId;
    }

    const reverseMappedCoreWorkflows: {
      workspaceWorkflowId: string;
      id: string;
    }[] = await this.workspaceRepository.manager.query(
      `SELECT DISTINCT ON ("workspaceWorkflowId") "workspaceWorkflowId", "id"
       FROM core."workflow"
       WHERE "workspaceId" = $1 AND "workspaceWorkflowId" = ANY($2::uuid[])
       ORDER BY "workspaceWorkflowId", "createdAt" ASC, "id" ASC`,
      [workspaceId, unresolvedWorkflowIds],
    );

    for (const { workspaceWorkflowId, id } of reverseMappedCoreWorkflows) {
      if (
        isNonEmptyString(workspaceWorkflowId) &&
        !coreWorkflowIdByWorkflowId.has(workspaceWorkflowId)
      ) {
        coreWorkflowIdByWorkflowId.set(workspaceWorkflowId, id);
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

    const { flatFieldMetadataMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatFieldMetadataMaps',
      ]);

    if (
      !isDefined(
        flatFieldMetadataMaps.byUniversalIdentifier[
          LEGACY_WORKFLOW_VERSION_CORE_WORKFLOW_VERSION_ID_FIELD_UNIVERSAL_IDENTIFIER
        ],
      )
    ) {
      this.logger.warn(
        `workflowVersion.coreWorkflowVersionId field missing for workspace ${workspaceId}, skipping core id write-back`,
      );

      return;
    }

    await this.workspaceOrmManager.executeInWorkspaceContext(async () => {
      const workspaceWorkflowVersionRepository =
        this.workspaceOrmManager.getRepository<LegacyWorkflowVersionWorkspaceEntity>(
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
}
