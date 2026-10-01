import { Command } from 'nest-commander';
import { isDefined } from 'twenty-shared/utils';
import { type DataSource, type QueryRunner } from 'typeorm';

import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { buildMissingPositionIdIndexes } from 'src/database/commands/upgrade-version-command/2-45/utils/build-missing-position-id-indexes.util';
import {
  buildPositionIdIndexes,
  type PositionIdIndex,
} from 'src/database/commands/upgrade-version-command/2-45/utils/build-position-id-indexes.util';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { type FlatIndexMetadata } from 'src/engine/metadata-modules/flat-index-metadata/types/flat-index-metadata.type';
import { POSITION_ID_INDEX_FIELD_NAMES } from 'src/engine/metadata-modules/object-metadata/utils/build-position-id-index-for-object.util';
import { WorkspaceSchemaManagerService } from 'src/engine/twenty-orm/workspace-schema-manager/workspace-schema-manager.service';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { WorkspaceMigrationBuilderException } from 'src/engine/workspace-manager/workspace-migration/exceptions/workspace-migration-builder-exception';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';
import { type UniversalFlatIndexMetadata } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-index-metadata.type';
import { getWorkspaceSchemaContextForMigration } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/utils/get-workspace-schema-context-for-migration.util';

const groupByApplication = <
  TIndex extends { applicationUniversalIdentifier: string },
>(
  indexes: TIndex[],
): Map<string, TIndex[]> => {
  const indexesByApplication = new Map<string, TIndex[]>();

  for (const index of indexes) {
    const applicationIndexes = indexesByApplication.get(
      index.applicationUniversalIdentifier,
    );

    if (isDefined(applicationIndexes)) {
      applicationIndexes.push(index);
    } else {
      indexesByApplication.set(index.applicationUniversalIdentifier, [index]);
    }
  }

  return indexesByApplication;
};

// Lists sort by position then id; without this index every page sorts the
// whole table. Built CONCURRENTLY so writes are not blocked on large tables
@RegisteredWorkspaceCommand('2.45.0', 1790867830150)
@Command({
  name: 'upgrade:2-45:add-position-id-indexes',
  description:
    'Index (position, id) on every object so the default list order does not sort the table',
})
export class AddPositionIdIndexesCommand extends ProvisionedWorkspaceCommandRunner {
  constructor(
    protected readonly workspaceIteratorService: WorkspaceIteratorService,
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly workspaceMigrationValidateBuildAndRunService: WorkspaceMigrationValidateBuildAndRunService,
    private readonly workspaceSchemaManagerService: WorkspaceSchemaManagerService,
  ) {
    super(workspaceIteratorService);
  }

  override async runOnWorkspace(args: RunOnWorkspaceArgs): Promise<void> {
    await this.up(args);
  }

  async up({
    workspaceId,
    dataSource,
    options,
  }: RunOnWorkspaceArgs): Promise<void> {
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

    const missingIndexes = buildMissingPositionIdIndexes({
      flatObjectMetadataMaps,
      flatFieldMetadataMaps,
      flatIndexMaps,
      now: new Date().toISOString(),
    });

    this.logger.log(
      `${options.dryRun ? '[DRY RUN] ' : ''}Workspace ${workspaceId}: adding ${missingIndexes.length} (position, id) index(es)`,
    );

    if (options.dryRun || missingIndexes.length === 0) {
      return;
    }

    await this.createIndexesConcurrently({
      dataSource,
      workspaceId,
      indexes: missingIndexes,
    });

    for (const [
      applicationUniversalIdentifier,
      applicationIndexes,
    ] of groupByApplication(
      missingIndexes.map(
        ({ universalFlatIndexMetadata }) => universalFlatIndexMetadata,
      ),
    )) {
      await this.runIndexMigration({
        workspaceId,
        applicationUniversalIdentifier,
        flatEntityToCreate: applicationIndexes,
        flatEntityToDelete: [],
      });
    }
  }

  async down({
    workspaceId,
    dataSource,
    options,
  }: RunOnWorkspaceArgs): Promise<void> {
    const { flatObjectMetadataMaps, flatFieldMetadataMaps, flatIndexMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatObjectMetadataMaps',
        'flatFieldMetadataMaps',
        'flatIndexMaps',
      ]);

    const positionIdIndexes = buildPositionIdIndexes({
      flatObjectMetadataMaps,
      flatFieldMetadataMaps,
      now: new Date().toISOString(),
    });
    const existingIndexes = positionIdIndexes
      .map(
        ({ universalFlatIndexMetadata }) =>
          flatIndexMaps.byUniversalIdentifier[
            universalFlatIndexMetadata.universalIdentifier
          ],
      )
      .filter(isDefined);

    this.logger.log(
      `${options.dryRun ? '[DRY RUN] ' : ''}Workspace ${workspaceId}: removing ${existingIndexes.length} (position, id) index(es)`,
    );

    if (options.dryRun) {
      return;
    }

    for (const [
      applicationUniversalIdentifier,
      applicationIndexes,
    ] of groupByApplication(existingIndexes)) {
      await this.runIndexMigration({
        workspaceId,
        applicationUniversalIdentifier,
        flatEntityToCreate: [],
        flatEntityToDelete: applicationIndexes,
      });
    }

    if (isDefined(dataSource)) {
      await this.dropUnrecordedIndexes({
        dataSource,
        workspaceId,
        indexes: positionIdIndexes,
      });
    }
  }

  // An up interrupted between the build and the metadata sync leaves indexes
  // the metadata migration does not know about
  private async dropUnrecordedIndexes({
    dataSource,
    workspaceId,
    indexes,
  }: {
    dataSource: DataSource;
    workspaceId: string;
    indexes: PositionIdIndex[];
  }): Promise<void> {
    const queryRunner = dataSource.createQueryRunner();

    await queryRunner.connect();

    try {
      for (const {
        flatObjectMetadata,
        universalFlatIndexMetadata,
      } of indexes) {
        const { schemaName } = getWorkspaceSchemaContextForMigration({
          workspaceId,
          objectMetadata: flatObjectMetadata,
        });

        await this.workspaceSchemaManagerService.indexManager.dropIndex({
          queryRunner,
          schemaName,
          indexName: universalFlatIndexMetadata.name,
          concurrently: true,
        });
      }
    } finally {
      await queryRunner.release();
    }
  }

  private async runIndexMigration({
    workspaceId,
    applicationUniversalIdentifier,
    flatEntityToCreate,
    flatEntityToDelete,
  }: {
    workspaceId: string;
    applicationUniversalIdentifier: string;
    flatEntityToCreate: UniversalFlatIndexMetadata[];
    flatEntityToDelete: FlatIndexMetadata[];
  }): Promise<void> {
    const result =
      await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunLegacyWorkspaceMigration(
        {
          isSystemBuild: true,
          workspaceId,
          applicationUniversalIdentifier,
          allFlatEntityOperationByMetadataName: {
            index: {
              flatEntityToCreate,
              flatEntityToDelete,
              flatEntityToUpdate: [],
            },
          },
        },
      );

    if (result.status === 'fail') {
      throw new WorkspaceMigrationBuilderException(result);
    }
  }

  private async createIndexesConcurrently({
    dataSource,
    workspaceId,
    indexes,
  }: {
    dataSource: DataSource;
    workspaceId: string;
    indexes: PositionIdIndex[];
  }): Promise<void> {
    const queryRunner = dataSource.createQueryRunner();

    await queryRunner.connect();

    try {
      for (const {
        flatObjectMetadata,
        universalFlatIndexMetadata,
      } of indexes) {
        const { schemaName, tableName } = getWorkspaceSchemaContextForMigration(
          {
            workspaceId,
            objectMetadata: flatObjectMetadata,
          },
        );

        await this.dropIndexIfInvalid({
          queryRunner,
          schemaName,
          indexName: universalFlatIndexMetadata.name,
        });

        await this.workspaceSchemaManagerService.indexManager.createIndex({
          queryRunner,
          schemaName,
          tableName,
          index: {
            name: universalFlatIndexMetadata.name,
            columns: POSITION_ID_INDEX_FIELD_NAMES,
            isUnique: false,
            type: universalFlatIndexMetadata.indexType,
          },
          concurrently: true,
        });
      }
    } finally {
      await queryRunner.release();
    }
  }

  // An interrupted CONCURRENTLY build leaves an invalid index that IF NOT
  // EXISTS would otherwise keep
  private async dropIndexIfInvalid({
    queryRunner,
    schemaName,
    indexName,
  }: {
    queryRunner: QueryRunner;
    schemaName: string;
    indexName: string;
  }): Promise<void> {
    const invalidIndexes: { name: string }[] = await queryRunner.query(
      `SELECT c.relname AS name
       FROM pg_index i
       JOIN pg_class c ON c.oid = i.indexrelid
       JOIN pg_namespace n ON n.oid = c.relnamespace
       WHERE n.nspname = $1 AND c.relname = $2 AND NOT i.indisvalid`,
      [schemaName, indexName],
    );

    if (invalidIndexes.length > 0) {
      await this.workspaceSchemaManagerService.indexManager.dropIndex({
        queryRunner,
        schemaName,
        indexName,
        concurrently: true,
      });
    }
  }
}
