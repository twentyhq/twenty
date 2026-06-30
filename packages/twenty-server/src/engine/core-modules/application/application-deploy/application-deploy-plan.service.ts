import { Injectable, Logger } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';

import { createHash } from 'crypto';

import { type Manifest } from 'twenty-shared/application';
import { DataSource } from 'typeorm';
import { ALL_METADATA_NAME } from 'twenty-shared/metadata';
import { isDefined } from 'twenty-shared/utils';

import {
  type ApplicationSyncPlanActionDTO,
  type ApplicationSyncPlanDTO,
  type ApplicationSyncPlanSummaryDTO,
} from 'src/engine/core-modules/application/application-development/dtos/application-sync-plan.dto';
import {
  type ApplicationDeployActionSeverity,
  classifyApplicationDeployActionSeverity,
} from 'src/engine/core-modules/application/application-deploy/utils/classify-application-deploy-action-severity.util';
import { ApplicationSyncService } from 'src/engine/core-modules/application/application-manifest/application-sync.service';
import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { findFlatEntityByUniversalIdentifier } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier.util';
import { getMetadataFlatEntityMapsKey } from 'src/engine/metadata-modules/flat-entity/utils/get-metadata-flat-entity-maps-key.util';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { type UniversalFlatEntityMaps } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-entity-maps.type';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { type AllUniversalWorkspaceMigrationAction } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/workspace-migration-action-common';
import { generateColumnDefinitions } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/utils/generate-column-definitions.util';
import { getWorkspaceSchemaContextForMigration } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/utils/get-workspace-schema-context-for-migration.util';

export const renderDeploySerial = (serial: number): string => `0.0.${serial}`;

const getActionUniversalIdentifier = (
  action: AllUniversalWorkspaceMigrationAction,
): string =>
  action.type === 'create'
    ? action.flatEntity.universalIdentifier
    : action.universalIdentifier;

const computePlanDigest = (
  actions: ApplicationSyncPlanActionDTO[],
  proposedVersion: string,
): string => {
  const normalizedActions = actions
    .map((action) => ({
      type: action.type,
      metadataName: action.metadataName,
      universalIdentifier: action.universalIdentifier,
      severity: action.severity,
    }))
    .sort((a, b) =>
      `${a.metadataName}:${a.universalIdentifier}:${a.type}`.localeCompare(
        `${b.metadataName}:${b.universalIdentifier}:${b.type}`,
      ),
    );

  return createHash('sha256')
    .update(JSON.stringify({ actions: normalizedActions, proposedVersion }))
    .digest('hex');
};

type DeployPlanMaps = {
  flatFieldMetadataMaps: UniversalFlatEntityMaps<FlatFieldMetadata>;
  flatObjectMetadataMaps: UniversalFlatEntityMaps<FlatObjectMetadata>;
};

@Injectable()
export class ApplicationDeployPlanService {
  private readonly logger = new Logger(ApplicationDeployPlanService.name);

  constructor(
    private readonly applicationService: ApplicationService,
    private readonly applicationSyncService: ApplicationSyncService,
    private readonly workspaceCacheService: WorkspaceCacheService,
    @InjectDataSource()
    private readonly coreDataSource: DataSource,
  ) {}

  public async computePlan({
    workspaceId,
    manifest,
  }: {
    workspaceId: string;
    manifest: Manifest;
  }): Promise<ApplicationSyncPlanDTO> {
    const application = await this.applicationService.findOneApplicationOrThrow(
      {
        universalIdentifier: manifest.application.universalIdentifier,
        workspaceId,
      },
    );

    const { workspaceMigration } =
      await this.applicationSyncService.synchronizeFromManifest({
        workspaceId,
        manifest,
        dryRun: true,
      });

    const { flatFieldMetadataMaps, flatObjectMetadataMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        getMetadataFlatEntityMapsKey(ALL_METADATA_NAME.fieldMetadata),
        getMetadataFlatEntityMapsKey(ALL_METADATA_NAME.objectMetadata),
      ]);

    const maps: DeployPlanMaps = {
      flatFieldMetadataMaps,
      flatObjectMetadataMaps,
    };

    const actions = await Promise.all(
      workspaceMigration.actions.map((action) =>
        this.buildPlanAction({ action, workspaceId, maps }),
      ),
    );

    const currentSerial = application.deploySerial ?? 0;
    const isEmpty = actions.length === 0;
    const nextSerial = isEmpty ? currentSerial : currentSerial + 1;
    const proposedVersion = renderDeploySerial(nextSerial);

    const summary = this.buildSummary(actions);

    return {
      applicationUniversalIdentifier: manifest.application.universalIdentifier,
      planId: null,
      planDigest: computePlanDigest(actions, proposedVersion),
      actions,
      summary,
      currentVersion: isDefined(application.deploySerial)
        ? renderDeploySerial(application.deploySerial)
        : null,
      proposedVersion,
      isEmpty,
      hasDestructiveActions: summary.destructiveCount > 0,
    };
  }

  private async buildPlanAction({
    action,
    workspaceId,
    maps,
  }: {
    action: AllUniversalWorkspaceMigrationAction;
    workspaceId: string;
    maps: DeployPlanMaps;
  }): Promise<ApplicationSyncPlanActionDTO> {
    const universalIdentifier = getActionUniversalIdentifier(action);

    const severity = classifyApplicationDeployActionSeverity({
      action,
      getCurrentEnumOptions: (fieldUniversalIdentifier) =>
        findFlatEntityByUniversalIdentifier({
          flatEntityMaps: maps.flatFieldMetadataMaps,
          universalIdentifier: fieldUniversalIdentifier,
        })?.options ?? null,
    });

    const { label, affectedRowCount } = await this.resolveLabelAndRowCount({
      action,
      universalIdentifier,
      severity,
      workspaceId,
      maps,
    });

    return {
      type: action.type,
      metadataName: action.metadataName,
      universalIdentifier,
      label,
      severity,
      affectedRowCount,
    };
  }

  private async resolveLabelAndRowCount({
    action,
    universalIdentifier,
    severity,
    workspaceId,
    maps,
  }: {
    action: AllUniversalWorkspaceMigrationAction;
    universalIdentifier: string;
    severity: ApplicationDeployActionSeverity;
    workspaceId: string;
    maps: DeployPlanMaps;
  }): Promise<{ label: string | null; affectedRowCount: number | null }> {
    if (action.metadataName === ALL_METADATA_NAME.objectMetadata) {
      const flatObjectMetadata = findFlatEntityByUniversalIdentifier({
        flatEntityMaps: maps.flatObjectMetadataMaps,
        universalIdentifier,
      });

      const label = flatObjectMetadata?.nameSingular ?? universalIdentifier;

      const affectedRowCount =
        action.type === 'delete' && isDefined(flatObjectMetadata)
          ? await this.countObjectRows({ workspaceId, flatObjectMetadata })
          : null;

      return { label, affectedRowCount };
    }

    if (action.metadataName === ALL_METADATA_NAME.fieldMetadata) {
      const flatFieldMetadata = findFlatEntityByUniversalIdentifier({
        flatEntityMaps: maps.flatFieldMetadataMaps,
        universalIdentifier,
      });

      const flatObjectMetadata = isDefined(flatFieldMetadata)
        ? Object.values(maps.flatObjectMetadataMaps.byUniversalIdentifier).find(
            (candidate) => candidate?.id === flatFieldMetadata.objectMetadataId,
          )
        : undefined;

      const label = isDefined(flatFieldMetadata)
        ? `${flatObjectMetadata?.nameSingular ?? '?'}.${flatFieldMetadata.name}`
        : universalIdentifier;

      const affectedRowCount =
        severity === 'destructive' &&
        action.type === 'delete' &&
        isDefined(flatFieldMetadata) &&
        isDefined(flatObjectMetadata)
          ? await this.countFieldRows({
              workspaceId,
              flatFieldMetadata,
              flatObjectMetadata,
            })
          : null;

      return { label, affectedRowCount };
    }

    return { label: universalIdentifier, affectedRowCount: null };
  }

  private async countObjectRows({
    workspaceId,
    flatObjectMetadata,
  }: {
    workspaceId: string;
    flatObjectMetadata: FlatObjectMetadata;
  }): Promise<number | null> {
    const { schemaName, tableName } = getWorkspaceSchemaContextForMigration({
      workspaceId,
      objectMetadata: flatObjectMetadata,
    });

    return this.runCount(
      `SELECT count(*)::bigint AS count FROM "${schemaName}"."${tableName}"`,
    );
  }

  private async countFieldRows({
    workspaceId,
    flatFieldMetadata,
    flatObjectMetadata,
  }: {
    workspaceId: string;
    flatFieldMetadata: FlatFieldMetadata;
    flatObjectMetadata: FlatObjectMetadata;
  }): Promise<number | null> {
    const { schemaName, tableName } = getWorkspaceSchemaContextForMigration({
      workspaceId,
      objectMetadata: flatObjectMetadata,
    });

    const columnNames = generateColumnDefinitions({
      flatFieldMetadata,
      flatObjectMetadata,
      workspaceId,
    }).map((columnDefinition) => columnDefinition.name);

    if (columnNames.length === 0) {
      return null;
    }

    const notNullPredicate = columnNames
      .map((columnName) => `"${columnName}" IS NOT NULL`)
      .join(' OR ');

    return this.runCount(
      `SELECT count(*)::bigint AS count FROM "${schemaName}"."${tableName}" WHERE ${notNullPredicate}`,
    );
  }

  private async runCount(query: string): Promise<number | null> {
    try {
      const result = await this.coreDataSource.query(query);

      const count = Number(result?.[0]?.count);

      return Number.isFinite(count) ? count : null;
    } catch (error) {
      this.logger.warn(
        `Failed to count affected rows for deploy plan: ${error instanceof Error ? error.message : String(error)}`,
      );

      return null;
    }
  }

  private buildSummary(
    actions: ApplicationSyncPlanActionDTO[],
  ): ApplicationSyncPlanSummaryDTO {
    return actions.reduce<ApplicationSyncPlanSummaryDTO>(
      (summary, action) => ({
        createCount: summary.createCount + (action.type === 'create' ? 1 : 0),
        updateCount: summary.updateCount + (action.type === 'update' ? 1 : 0),
        deleteCount: summary.deleteCount + (action.type === 'delete' ? 1 : 0),
        breakingCount:
          summary.breakingCount + (action.severity === 'breaking' ? 1 : 0),
        destructiveCount:
          summary.destructiveCount +
          (action.severity === 'destructive' ? 1 : 0),
        totalAffectedRows:
          summary.totalAffectedRows + (action.affectedRowCount ?? 0),
      }),
      {
        createCount: 0,
        updateCount: 0,
        deleteCount: 0,
        breakingCount: 0,
        destructiveCount: 0,
        totalAffectedRows: 0,
      },
    );
  }
}
