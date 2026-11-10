import { Command } from 'nest-commander';
import { isDefined } from 'twenty-shared/utils';
import { type DataSource } from 'typeorm';

import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import {
  buildUniqueFieldIndexReplacements,
  type UniqueFieldIndexReplacement,
} from 'src/database/commands/upgrade-version-command/2-58/utils/build-unique-field-index-replacements.util';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { type AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';
import { type FlatIndexMetadata } from 'src/engine/metadata-modules/flat-index-metadata/types/flat-index-metadata.type';
import { WorkspaceSchemaManagerService } from 'src/engine/twenty-orm/workspace-schema-manager/workspace-schema-manager.service';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { TWENTY_STANDARD_APPLICATION } from 'src/engine/workspace-manager/twenty-standard-application/constants/twenty-standard-applications';
import { WorkspaceMigrationBuilderException } from 'src/engine/workspace-manager/workspace-migration/exceptions/workspace-migration-builder-exception';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';
import { type UniversalFlatIndexMetadata } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-index-metadata.type';
import { computeFlatIndexFieldColumnNames } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/action-handlers/index/utils/index-action-handler.utils';
import { getWorkspaceSchemaContextForMigration } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/utils/get-workspace-schema-context-for-migration.util';

type IndexOperations = {
  flatEntityToCreate: UniversalFlatIndexMetadata[];
  flatEntityToDelete: FlatIndexMetadata[];
};

@RegisteredWorkspaceCommand('2.58.0', 1794306284653)
@Command({
  name: 'upgrade:2-58:exclude-deleted-records-from-unique-field-indexes',
  description:
    'Rebuild the index backing each unique field as a partial index on non-deleted records, so a deleted record no longer blocks its value',
})
export class ExcludeDeletedRecordsFromUniqueFieldIndexesCommand extends ProvisionedWorkspaceCommandRunner {
  constructor(
    protected readonly workspaceIteratorService: WorkspaceIteratorService,
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
    if (!isDefined(dataSource)) {
      this.logger.log(`No data source for workspace ${workspaceId}, skipping`);

      return;
    }

    const {
      flatObjectMetadataMaps,
      flatFieldMetadataMaps,
      flatIndexMaps,
      flatApplicationMaps,
    } = await this.workspaceCacheService.getOrRecompute(workspaceId, [
      'flatObjectMetadataMaps',
      'flatFieldMetadataMaps',
      'flatIndexMaps',
      'flatApplicationMaps',
    ]);

    const replacements = buildUniqueFieldIndexReplacements({
      flatObjectMetadataMaps,
      flatFieldMetadataMaps,
      flatIndexMaps,
      flatApplicationMaps,
      now: new Date().toISOString(),
    });

    if (replacements.length === 0) {
      this.logger.log(
        `No unique field index to rebuild for workspace ${workspaceId}`,
      );

      return;
    }

    if (options.dryRun) {
      for (const replacement of replacements) {
        this.logger.log(
          `[DRY RUN] Would replace index ${replacement.legacyFlatIndexMetadata.name} with ${replacement.replacementFlatIndexMetadata.name} for workspace ${workspaceId}`,
        );
      }

      return;
    }

    await this.createReplacementIndexesConcurrently({
      workspaceId,
      dataSource,
      replacements,
      flatFieldMetadataMaps,
    });

    const indexOperationsByApplicationUniversalIdentifier = new Map<
      string,
      IndexOperations
    >();
    const getIndexOperations = (
      applicationUniversalIdentifier: string,
    ): IndexOperations => {
      const indexOperations =
        indexOperationsByApplicationUniversalIdentifier.get(
          applicationUniversalIdentifier,
        ) ?? { flatEntityToCreate: [], flatEntityToDelete: [] };

      indexOperationsByApplicationUniversalIdentifier.set(
        applicationUniversalIdentifier,
        indexOperations,
      );

      return indexOperations;
    };

    for (const replacement of replacements) {
      getIndexOperations(
        replacement.legacyApplicationUniversalIdentifier,
      ).flatEntityToDelete.push(replacement.legacyFlatIndexMetadata);

      if (!replacement.isReplacementAlreadyCreated) {
        getIndexOperations(
          replacement.replacementFlatIndexMetadata
            .applicationUniversalIdentifier,
        ).flatEntityToCreate.push(replacement.replacementFlatIndexMetadata);
      }
    }

    for (const [
      applicationUniversalIdentifier,
      indexOperations,
    ] of indexOperationsByApplicationUniversalIdentifier) {
      await this.runIndexMigration({
        workspaceId,
        applicationUniversalIdentifier,
        indexOperations,
      });
    }

    this.logger.log(
      `Rebuilt ${replacements.length} unique field index(es) for workspace ${workspaceId}`,
    );
  }

  private async createReplacementIndexesConcurrently({
    workspaceId,
    dataSource,
    replacements,
    flatFieldMetadataMaps,
  }: {
    workspaceId: string;
    dataSource: DataSource;
    replacements: UniqueFieldIndexReplacement[];
    flatFieldMetadataMaps: AllFlatEntityMaps['flatFieldMetadataMaps'];
  }): Promise<void> {
    const queryRunner = dataSource.createQueryRunner();
    let isQueryRunnerConnected = false;

    try {
      await queryRunner.connect();
      isQueryRunnerConnected = true;

      for (const replacement of replacements) {
        if (replacement.isReplacementAlreadyCreated) {
          continue;
        }

        const { legacyFlatIndexMetadata, replacementFlatIndexMetadata } =
          replacement;
        const { schemaName, tableName } = getWorkspaceSchemaContextForMigration(
          {
            workspaceId,
            objectMetadata: replacement.flatObjectMetadata,
          },
        );

        const invalidIndexes = await dataSource.query<{ name: string }[]>(
          `SELECT c.relname AS name
           FROM pg_index i
           JOIN pg_class c ON c.oid = i.indexrelid
           JOIN pg_namespace n ON n.oid = c.relnamespace
           WHERE n.nspname = $1 AND c.relname = $2 AND NOT i.indisvalid`,
          [schemaName, replacementFlatIndexMetadata.name],
        );

        for (const { name } of invalidIndexes) {
          await this.workspaceSchemaManagerService.indexManager.dropIndex({
            queryRunner,
            schemaName,
            indexName: name,
          });

          this.logger.warn(
            `Dropped invalid index ${name} left by an interrupted build in workspace ${workspaceId}, recreating it`,
          );
        }

        await this.workspaceSchemaManagerService.indexManager.createIndex({
          queryRunner,
          schemaName,
          tableName,
          index: {
            name: replacementFlatIndexMetadata.name,
            columns: computeFlatIndexFieldColumnNames({
              flatIndexFieldMetadatas:
                legacyFlatIndexMetadata.flatIndexFieldMetadatas,
              flatFieldMetadataMaps,
            }),
            isUnique: replacementFlatIndexMetadata.isUnique,
            type: replacementFlatIndexMetadata.indexType,
            where: replacementFlatIndexMetadata.indexWhereClause ?? undefined,
          },
          concurrently: true,
        });
      }
    } finally {
      if (isQueryRunnerConnected) {
        await queryRunner.release();
      }
    }
  }

  private async runIndexMigration({
    workspaceId,
    applicationUniversalIdentifier,
    indexOperations,
  }: {
    workspaceId: string;
    applicationUniversalIdentifier: string;
    indexOperations: IndexOperations;
  }): Promise<void> {
    const migrationArgs = {
      shouldDeferActions: false,
      isSystemBuild: true,
      applicationUniversalIdentifier,
      workspaceId,
      allFlatEntityOperationByMetadataName: {
        index: { ...indexOperations, flatEntityToUpdate: [] },
      },
    };

    const result =
      applicationUniversalIdentifier ===
      TWENTY_STANDARD_APPLICATION.universalIdentifier
        ? await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunLegacyWorkspaceMigration(
            migrationArgs,
          )
        : await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunWorkspaceMigration(
            migrationArgs,
          );

    if (result.status === 'fail') {
      throw new WorkspaceMigrationBuilderException(result);
    }
  }
}
