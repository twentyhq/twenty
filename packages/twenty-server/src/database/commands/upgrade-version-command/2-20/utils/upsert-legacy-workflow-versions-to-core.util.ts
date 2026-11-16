import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';
import { In, type Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';

import { type CommandLogger } from 'src/database/commands/logger';
import { LEGACY_WORKFLOW_VERSION_CORE_WORKFLOW_VERSION_ID_FIELD_UNIVERSAL_IDENTIFIER } from 'src/database/commands/upgrade-version-command/2-22/constants/legacy-workflow-version-universal-identifiers.constant';
import {
  type LegacyWorkflowVersionStatus,
  type LegacyWorkflowVersionWorkspaceEntity,
} from 'src/database/commands/upgrade-version-command/2-20/types/legacy-workflow-version-workspace-entity.type';
import { type ApplicationService } from 'src/engine/core-modules/application/application.service';
import {
  WorkflowVersionStatus as CoreWorkflowVersionStatus,
  type WorkflowVersionEntity,
} from 'src/engine/core-modules/workflow/entities/workflow-version.entity';
import {
  CoreWorkflowMetadataException,
  CoreWorkflowMetadataExceptionCode,
} from 'src/engine/core-modules/workflow/exceptions/core-workflow-metadata.exception';
import { resolveCoreWorkflowIdsByWorkspaceWorkflowId } from 'src/database/commands/upgrade-version-command/2-20/utils/resolve-core-workflow-ids-by-workspace-workflow-id.util';
import { type WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { type WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.service';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { type WorkspaceOrmManager } from 'src/engine/twenty-orm/workspace-orm.manager';
import { type WorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/workspace-scoped-repository';
import { type WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { WorkspaceMigrationBuilderException } from 'src/engine/workspace-manager/workspace-migration/exceptions/workspace-migration-builder-exception';
import { type WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';
import { type UniversalFlatWorkflowVersion } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-workflow-version.type';

export type UpsertLegacyWorkflowVersionsToCoreDependencies = {
  applicationService: ApplicationService;
  coreWorkflowVersionRepository: WorkspaceScopedRepository<WorkflowVersionEntity>;
  flatEntityMapsCacheService: WorkspaceManyOrAllFlatEntityMapsCacheService;
  logger: CommandLogger;
  workspaceCacheService: WorkspaceCacheService;
  workspaceMigrationValidateBuildAndRunService: WorkspaceMigrationValidateBuildAndRunService;
  workspaceOrmManager: WorkspaceOrmManager;
  workspaceRepository: Repository<WorkspaceEntity>;
};

const CORE_STATUS_BY_LEGACY_STATUS: Record<
  LegacyWorkflowVersionStatus,
  CoreWorkflowVersionStatus
> = {
  DRAFT: CoreWorkflowVersionStatus.DRAFT,
  ACTIVE: CoreWorkflowVersionStatus.ACTIVE,
  DEACTIVATED: CoreWorkflowVersionStatus.DEACTIVATED,
  ARCHIVED: CoreWorkflowVersionStatus.ARCHIVED,
};

const resolveCoreWorkflowIdByWorkflowId = async ({
  workspaceId,
  workflowIds,
  dependencies,
}: {
  workspaceId: string;
  workflowIds: string[];
  dependencies: UpsertLegacyWorkflowVersionsToCoreDependencies;
}): Promise<Map<string, string>> => {
  const distinctWorkflowIds = [...new Set(workflowIds)];

  if (distinctWorkflowIds.length === 0) {
    return new Map();
  }

  return resolveCoreWorkflowIdsByWorkspaceWorkflowId({
    executeQuery: (query, parameters) =>
      dependencies.workspaceRepository.manager.query(query, parameters),
    workspaceId,
    workspaceWorkflowIds: distinctWorkflowIds,
  });
};

const resolveOwnedCoreVersions = async ({
  workspaceId,
  workflowVersions,
  dependencies,
}: {
  workspaceId: string;
  workflowVersions: Pick<
    LegacyWorkflowVersionWorkspaceEntity,
    'coreWorkflowVersionId'
  >[];
  dependencies: UpsertLegacyWorkflowVersionsToCoreDependencies;
}): Promise<Map<string, string | null>> => {
  const candidateIds = workflowVersions
    .map((workflowVersion) => workflowVersion.coreWorkflowVersionId)
    .filter(isNonEmptyString);

  if (candidateIds.length === 0) {
    return new Map();
  }

  const ownedRows = await dependencies.coreWorkflowVersionRepository.find(
    workspaceId,
    {
      where: { id: In(candidateIds) },
      select: { id: true, coreWorkflowId: true },
    },
  );

  return new Map(ownedRows.map((row) => [row.id, row.coreWorkflowId ?? null]));
};

const writeBackCoreVersionIds = async ({
  workspaceId,
  coreVersionIdByWorkspaceRecordId,
  dependencies,
}: {
  workspaceId: string;
  coreVersionIdByWorkspaceRecordId: Map<string, string>;
  dependencies: UpsertLegacyWorkflowVersionsToCoreDependencies;
}): Promise<void> => {
  if (coreVersionIdByWorkspaceRecordId.size === 0) {
    return;
  }

  const { flatFieldMetadataMaps } =
    await dependencies.workspaceCacheService.getOrRecompute(workspaceId, [
      'flatFieldMetadataMaps',
    ]);

  const hasCoreWorkflowVersionIdField = isDefined(
    flatFieldMetadataMaps.byUniversalIdentifier[
      LEGACY_WORKFLOW_VERSION_CORE_WORKFLOW_VERSION_ID_FIELD_UNIVERSAL_IDENTIFIER
    ],
  );

  if (!hasCoreWorkflowVersionIdField) {
    dependencies.logger.warn(
      `workflowVersion.coreWorkflowVersionId field missing for workspace ${workspaceId}, skipping core id write-back`,
    );

    return;
  }

  await dependencies.workspaceOrmManager.executeInWorkspaceContext(async () => {
    const workspaceWorkflowVersionRepository =
      dependencies.workspaceOrmManager.getRepositoryWithoutPermissionChecks<LegacyWorkflowVersionWorkspaceEntity>(
        'workflowVersion',
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
};

export const upsertLegacyWorkflowVersionsToCore = async ({
  workspaceId,
  workflowVersions,
  dependencies,
}: {
  workspaceId: string;
  workflowVersions: Pick<
    LegacyWorkflowVersionWorkspaceEntity,
    | 'id'
    | 'coreWorkflowVersionId'
    | 'trigger'
    | 'steps'
    | 'status'
    | 'workflowId'
  >[];
  dependencies: UpsertLegacyWorkflowVersionsToCoreDependencies;
}): Promise<void> => {
  if (workflowVersions.length === 0) {
    return;
  }

  const coreWorkflowIdByWorkflowId = await resolveCoreWorkflowIdByWorkflowId({
    workspaceId,
    workflowIds: workflowVersions.map(
      (workflowVersion) => workflowVersion.workflowId,
    ),
    dependencies,
  });

  const ownedCoreVersions = await resolveOwnedCoreVersions({
    workspaceId,
    workflowVersions,
    dependencies,
  });

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
      status: CORE_STATUS_BY_LEGACY_STATUS[workflowVersion.status],
      universalIdentifier: uuidv4(),
    };
  });

  const { workspaceCustomFlatApplication } =
    await dependencies.applicationService.findWorkspaceTwentyStandardAndCustomApplicationOrThrow(
      { workspaceId },
    );

  let { flatWorkflowVersionMaps } =
    await dependencies.flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
      { workspaceId, flatMapsKeys: ['flatWorkflowVersionMaps'] },
    );

  const persistedCoreVersionIds = new Set(
    (
      await dependencies.coreWorkflowVersionRepository.find(workspaceId, {
        where: { id: In(coreRows.map(({ id }) => id)) },
        select: { id: true },
      })
    ).map(({ id }) => id),
  );

  if (
    coreRows.some(
      ({ id }) =>
        persistedCoreVersionIds.has(id) &&
        !isDefined(
          findFlatEntityByIdInFlatEntityMaps({
            flatEntityId: id,
            flatEntityMaps: flatWorkflowVersionMaps,
          }),
        ),
    )
  ) {
    await dependencies.flatEntityMapsCacheService.invalidateFlatEntityMaps({
      workspaceId,
      flatMapsKeys: ['flatWorkflowVersionMaps'],
    });
    ({ flatWorkflowVersionMaps } =
      await dependencies.flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        { workspaceId, flatMapsKeys: ['flatWorkflowVersionMaps'] },
      ));
  }

  const timestamp = new Date().toISOString();
  const flatVersionsToCreate: (UniversalFlatWorkflowVersion & {
    id?: string;
  })[] = [];
  const flatVersionsToUpdate: UniversalFlatWorkflowVersion[] = [];

  for (const coreRow of coreRows) {
    const existingFlatWorkflowVersion = persistedCoreVersionIds.has(coreRow.id)
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

  const validateAndBuildResult =
    await dependencies.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunWorkspaceMigration(
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

  await writeBackCoreVersionIds({
    workspaceId,
    coreVersionIdByWorkspaceRecordId,
    dependencies,
  });

  await dependencies.workspaceCacheService.invalidateAndRecompute(workspaceId, [
    'workflowAutomatedTriggerMaps',
  ]);
};
