import { Command } from 'nest-commander';
import {
  DEFAULT_RELATIONS_OBJECTS_STANDARD_IDS,
  STANDARD_OBJECTS,
} from 'twenty-shared/metadata';
import { isDefined } from 'twenty-shared/utils';

import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import {
  buildMissingSystemRelationIndexes,
  type MissingSystemRelationIndex,
  type SystemRelationHolderNameSingular,
} from 'src/database/commands/upgrade-version-command/2-42/utils/build-missing-system-relation-indexes.util';
import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { findFlatEntityByUniversalIdentifier } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier.util';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { WorkspaceSchemaManagerService } from 'src/engine/twenty-orm/workspace-schema-manager/workspace-schema-manager.service';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';
import { getWorkspaceSchemaContextForMigration } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/utils/get-workspace-schema-context-for-migration.util';

@RegisteredWorkspaceCommand('2.42.0', 1789663454000)
@Command({
  name: 'upgrade:2-42:backfill-missing-system-relation-indexes',
  description:
    'Create the missing join column index of app-owned target* system relation legs on timelineActivity, attachment, noteTarget and taskTarget. Indexes are created with CONCURRENTLY so writes are not blocked.',
})
export class BackfillMissingSystemRelationIndexesCommand extends ProvisionedWorkspaceCommandRunner {
  constructor(
    protected readonly workspaceIteratorService: WorkspaceIteratorService,
    private readonly applicationService: ApplicationService,
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly workspaceMigrationValidateBuildAndRunService: WorkspaceMigrationValidateBuildAndRunService,
    private readonly workspaceSchemaManagerService: WorkspaceSchemaManagerService,
  ) {
    super(workspaceIteratorService);
  }

  override async runOnWorkspace({
    workspaceId,
    dataSource,
    options,
  }: RunOnWorkspaceArgs): Promise<void> {
    const isDryRun = options.dryRun ?? false;

    if (!isDefined(dataSource)) {
      this.logger.log(`No data source for workspace ${workspaceId}, skipping`);

      return;
    }

    const { flatObjectMetadataMaps, flatFieldMetadataMaps, flatIndexMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatObjectMetadataMaps',
        'flatFieldMetadataMaps',
        'flatIndexMaps',
      ]);

    const holderFlatObjectMetadataByNameSingular = {} as Record<
      SystemRelationHolderNameSingular,
      FlatObjectMetadata
    >;

    for (const holderNameSingular of DEFAULT_RELATIONS_OBJECTS_STANDARD_IDS) {
      const holderFlatObjectMetadata =
        findFlatEntityByUniversalIdentifier<FlatObjectMetadata>({
          flatEntityMaps: flatObjectMetadataMaps,
          universalIdentifier:
            STANDARD_OBJECTS[holderNameSingular].universalIdentifier,
        });

      if (!isDefined(holderFlatObjectMetadata)) {
        this.logger.log(
          `Standard object ${holderNameSingular} does not exist for workspace ${workspaceId}, skipping`,
        );

        return;
      }

      holderFlatObjectMetadataByNameSingular[holderNameSingular] =
        holderFlatObjectMetadata;
    }

    const { twentyStandardFlatApplication } =
      await this.applicationService.findWorkspaceTwentyStandardAndCustomApplicationOrThrow(
        { workspaceId },
      );

    const missingIndexes = buildMissingSystemRelationIndexes({
      flatFieldMetadataMaps,
      flatIndexMaps,
      holderFlatObjectMetadataByNameSingular,
      twentyStandardApplicationUniversalIdentifier:
        twentyStandardFlatApplication.universalIdentifier,
    });

    if (missingIndexes.length === 0) {
      this.logger.log(
        `System relation indexes already present for workspace ${workspaceId}, skipping`,
      );

      return;
    }

    const indexesToCreate = missingIndexes.map((missingIndex) => ({
      missingIndex,
      ...getWorkspaceSchemaContextForMigration({
        workspaceId,
        objectMetadata: missingIndex.holderFlatObjectMetadata,
      }),
    }));

    if (isDryRun) {
      for (const { missingIndex, tableName } of indexesToCreate) {
        this.logger.log(
          `[DRY RUN] Would create index ${missingIndex.universalFlatIndexMetadata.name} on ${tableName}(${missingIndex.joinColumnName}) for workspace ${workspaceId}`,
        );
      }

      return;
    }

    const queryRunner = dataSource.createQueryRunner();
    let isQueryRunnerConnected = false;

    try {
      await queryRunner.connect();
      isQueryRunnerConnected = true;

      for (const { missingIndex, schemaName, tableName } of indexesToCreate) {
        await this.workspaceSchemaManagerService.indexManager.createIndex({
          queryRunner,
          schemaName,
          tableName,
          index: {
            name: missingIndex.universalFlatIndexMetadata.name,
            columns: [missingIndex.joinColumnName],
            isUnique: missingIndex.universalFlatIndexMetadata.isUnique,
            type: missingIndex.universalFlatIndexMetadata.indexType,
          },
          concurrently: true,
        });

        this.logger.log(
          `Created index ${missingIndex.universalFlatIndexMetadata.name} on ${tableName}(${missingIndex.joinColumnName}) for workspace ${workspaceId}`,
        );
      }
    } finally {
      if (isQueryRunnerConnected) {
        await queryRunner.release();
      }
    }

    const missingIndexesByApplicationUniversalIdentifier = new Map<
      string,
      MissingSystemRelationIndex[]
    >();

    for (const missingIndex of missingIndexes) {
      const { applicationUniversalIdentifier } =
        missingIndex.universalFlatIndexMetadata;

      missingIndexesByApplicationUniversalIdentifier.set(applicationUniversalIdentifier, [
        ...(missingIndexesByApplicationUniversalIdentifier.get(
          applicationUniversalIdentifier,
        ) ?? []),
        missingIndex,
      ]);
    }

    for (const [
      applicationUniversalIdentifier,
      applicationMissingIndexes,
    ] of missingIndexesByApplicationUniversalIdentifier) {
      const result =
        await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunLegacyWorkspaceMigration(
          {
            isSystemBuild: true,
            workspaceId,
            applicationUniversalIdentifier,
            allFlatEntityOperationByMetadataName: {
              index: {
                flatEntityToCreate: applicationMissingIndexes.map(
                  ({ universalFlatIndexMetadata }) =>
                    universalFlatIndexMetadata,
                ),
                flatEntityToDelete: [],
                flatEntityToUpdate: [],
              },
            },
          },
        );

      if (result.status === 'fail') {
        throw new Error(
          `Failed to persist system relation index metadata for application ${applicationUniversalIdentifier} in workspace ${workspaceId}:\n${JSON.stringify(result, null, 2)}`,
        );
      }
    }

    this.logger.log(
      `Backfilled ${missingIndexes.length} system relation index(es) for workspace ${workspaceId}`,
    );
  }
}
