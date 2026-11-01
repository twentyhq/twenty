import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';

import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { DataSource } from 'typeorm';

import { ACTIVE_AGENT_HISTORY_TABLES } from 'src/database/commands/agent-history/agent-history-tables.constant';
import {
  getAgentHistorySchemaAdditions,
  type LegacyObjectAccess,
} from 'src/database/commands/agent-history/utils/get-agent-history-schema-additions.util';
import { getLegacyAgentHistoryFlatFieldMetadatas } from 'src/database/commands/agent-history/utils/get-legacy-agent-history-flat-field-metadatas.util';
import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { addFlatEntityToFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/add-flat-entity-to-flat-entity-maps-or-throw.util';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { computeTwentyStandardApplicationAllFlatEntityMaps } from 'src/engine/workspace-manager/twenty-standard-application/utils/twenty-standard-application-all-flat-entity-maps.constant';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';

@Injectable()
export class AgentHistorySchemaService {
  constructor(
    private readonly applicationService: ApplicationService,
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly migrations: WorkspaceMigrationValidateBuildAndRunService,
    @InjectDataSource()
    private readonly coreDataSource: DataSource,
  ) {}

  async prepare(workspaceId: string, dryRun: boolean): Promise<void> {
    // The migration builder mutates its optimistic maps even on dry runs, so keep them out of the cache until DDL succeeds
    const existing = structuredClone(
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatObjectMetadataMaps',
        'flatFieldMetadataMaps',
        'flatIndexMaps',
        'featureFlagsMap',
        'billingEntitlements',
      ]),
    );
    const { twentyStandardFlatApplication } =
      await this.applicationService.findWorkspaceTwentyStandardAndCustomApplicationOrThrow(
        { workspaceId },
      );
    const {
      allFlatEntityMaps: standard,
      idByUniversalIdentifierByMetadataName,
    } = computeTwentyStandardApplicationAllFlatEntityMaps({
      now: new Date().toISOString(),
      workspaceId,
      twentyStandardApplicationId: twentyStandardFlatApplication.id,
    });
    const historyObjectUniversalIdentifiers = ACTIVE_AGENT_HISTORY_TABLES.map(
      ({ name }) => STANDARD_OBJECTS[name].universalIdentifier,
    );
    if (!dryRun) {
      await this.protectUnprotectedHistoryObjects({
        workspaceId,
        historyObjectUniversalIdentifiers,
      });
    }
    const legacyObjectAccesses = await this.coreDataSource.query<
      (LegacyObjectAccess & { universalIdentifier: string })[]
    >(
      `SELECT "universalIdentifier", readability, writability FROM core."objectMetadata"
        WHERE "workspaceId" = $1 AND "universalIdentifier" = ANY($2)`,
      [workspaceId, historyObjectUniversalIdentifiers],
    );
    const { objects, fields, indexes, protectedFieldUniversalIdentifiers } =
      getAgentHistorySchemaAdditions({
        existing,
        legacyObjectAccessByUniversalIdentifier: Object.fromEntries(
          legacyObjectAccesses.map(({ universalIdentifier, ...access }) => [
            universalIdentifier,
            access,
          ]),
        ),
        standard: {
          ...standard,
          flatFieldMetadataMaps: getLegacyAgentHistoryFlatFieldMetadatas({
            standard,
          }).reduce(
            (maps, flatEntity) =>
              addFlatEntityToFlatEntityMapsOrThrow({
                flatEntityMaps: maps,
                flatEntity,
              }),
            standard.flatFieldMetadataMaps,
          ),
        },
      });
    if (objects.length + fields.length + indexes.length === 0) {
      return;
    }
    // Same from/to path as standard application sync; custom-object side effects must not expand this schema
    const result =
      await this.migrations.validateBuildAndRunWorkspaceMigrationFromTo({
        shouldDeferActions: false,
        workspaceId,
        dryRun,
        buildOptions: {
          isSystemBuild: true,
          inferDeletionFromMissingEntities: {},
          applicationUniversalIdentifier:
            twentyStandardFlatApplication.universalIdentifier,
        },
        additionalCacheDataMaps: {
          featureFlagsMap: existing.featureFlagsMap,
          billingEntitlements: existing.billingEntitlements,
        },
        idByUniversalIdentifierByMetadataName,
        fromToAllFlatEntityMaps: {
          flatObjectMetadataMaps: {
            from: existing.flatObjectMetadataMaps,
            to: objects.reduce(
              (maps, flatEntity) =>
                addFlatEntityToFlatEntityMapsOrThrow({
                  flatEntityMaps: maps,
                  flatEntity,
                }),
              existing.flatObjectMetadataMaps,
            ),
          },
          flatFieldMetadataMaps: {
            from: existing.flatFieldMetadataMaps,
            to: fields.reduce(
              (maps, flatEntity) =>
                addFlatEntityToFlatEntityMapsOrThrow({
                  flatEntityMaps: maps,
                  flatEntity,
                }),
              existing.flatFieldMetadataMaps,
            ),
          },
          flatIndexMaps: {
            from: existing.flatIndexMaps,
            to: indexes.reduce(
              (maps, flatEntity) =>
                addFlatEntityToFlatEntityMapsOrThrow({
                  flatEntityMaps: maps,
                  flatEntity,
                }),
              existing.flatIndexMaps,
            ),
          },
        },
      });
    if (result.status === 'fail') {
      throw new Error(
        `Agent history schema validation failed: ${JSON.stringify(result)}`,
      );
    }
    if (dryRun) {
      return;
    }
    await this.protectUnprotectedHistoryObjects({
      workspaceId,
      historyObjectUniversalIdentifiers,
    });
    await this.coreDataSource.query(
      `UPDATE core."fieldMetadata" SET writability = 'SYSTEM'
        WHERE "workspaceId" = $1 AND "universalIdentifier" = ANY($2)`,
      [workspaceId, protectedFieldUniversalIdentifiers],
    );
  }

  // Objects still at the column defaults were just provisioned, so this also repairs an interrupted run
  private async protectUnprotectedHistoryObjects({
    workspaceId,
    historyObjectUniversalIdentifiers,
  }: {
    workspaceId: string;
    historyObjectUniversalIdentifiers: string[];
  }): Promise<void> {
    const protectedObjects: { id: string }[] = await this.coreDataSource.query(
      `UPDATE core."objectMetadata" SET readability = 'SYSTEM', writability = 'SYSTEM'
        WHERE "workspaceId" = $1 AND "universalIdentifier" = ANY($2)
          AND readability = 'OPEN' AND writability = 'OPEN'
        RETURNING id`,
      [workspaceId, historyObjectUniversalIdentifiers],
    );

    await this.coreDataSource.query(
      `UPDATE core."fieldMetadata" SET writability = 'SYSTEM'
        WHERE "workspaceId" = $1 AND "objectMetadataId" = ANY($2::uuid[])`,
      [workspaceId, protectedObjects.map(({ id }) => id)],
    );
  }
}
