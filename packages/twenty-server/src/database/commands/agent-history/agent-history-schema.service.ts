import { Injectable } from '@nestjs/common';

import { getAgentHistorySchemaAdditions } from 'src/database/commands/agent-history/utils/get-agent-history-schema-additions.util';
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
  ) {}

  async prepare(workspaceId: string, dryRun: boolean): Promise<void> {
    // The migration builder mutates its optimistic maps, even on dry runs.
    // Keep those changes out of the live metadata cache until DDL succeeds.
    const existing = structuredClone(
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatObjectMetadataMaps',
        'flatFieldMetadataMaps',
        'flatIndexMaps',
        'featureFlagsMap',
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
    const { objects, fields, indexes } = getAgentHistorySchemaAdditions({
      existing,
      standard,
    });
    if (objects.length + fields.length + indexes.length === 0) {
      return;
    }
    // Standard definitions use the same from/to path as standard application
    // synchronization; custom-object side effects must not expand this schema.
    const result =
      await this.migrations.validateBuildAndRunWorkspaceMigrationFromTo({
        workspaceId,
        dryRun,
        buildOptions: {
          isSystemBuild: true,
          inferDeletionFromMissingEntities: {},
          applicationUniversalIdentifier:
            twentyStandardFlatApplication.universalIdentifier,
        },
        additionalCacheDataMaps: { featureFlagsMap: existing.featureFlagsMap },
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
  }
}
