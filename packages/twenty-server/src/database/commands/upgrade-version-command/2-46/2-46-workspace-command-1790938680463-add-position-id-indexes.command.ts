import groupBy from 'lodash.groupby';
import { Command } from 'nest-commander';
import { isDefined } from 'twenty-shared/utils';
import { type DataSource, type QueryRunner } from 'typeorm';

import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import {
  buildPositionIdIndexes,
  type PositionIdIndex,
} from 'src/database/commands/upgrade-version-command/2-46/utils/build-position-id-indexes.util';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { type FlatIndexMetadata } from 'src/engine/metadata-modules/flat-index-metadata/types/flat-index-metadata.type';
import { POSITION_ID_INDEX_FIELD_NAMES } from 'src/engine/metadata-modules/object-metadata/utils/build-position-id-index-for-object.util';
import { WorkspaceSchemaManagerService } from 'src/engine/twenty-orm/workspace-schema-manager/workspace-schema-manager.service';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { WorkspaceMigrationBuilderException } from 'src/engine/workspace-manager/workspace-migration/exceptions/workspace-migration-builder-exception';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';
import { type UniversalFlatIndexMetadata } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-index-metadata.type';
import { getWorkspaceSchemaContextForMigration } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/utils/get-workspace-schema-context-for-migration.util';

// Lists sort by position then id; without this index every page sorts the
// whole table. Built CONCURRENTLY so writes are not blocked on large tables
@RegisteredWorkspaceCommand('2.46.0', 1790938680463)
@Command({
  name: 'upgrade:2-46:add-position-id-indexes',
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

    const { positionIdIndexes, flatIndexMaps } =
      await this.loadPositionIdIndexes(workspaceId);
    const missingIndexes = positionIdIndexes.filter(
      ({ universalFlatIndexMetadata }) =>
        !isDefined(
          flatIndexMaps.byUniversalIdentifier[
            universalFlatIndexMetadata.universalIdentifier
          ],
        ),
    );

    this.logger.log(
      `${options.dryRun ? '[DRY RUN] ' : ''}Workspace ${workspaceId}: adding ${missingIndexes.length} (position, id) index(es)`,
    );

    if (options.dryRun || missingIndexes.length === 0) {
      return;
    }

    await this.forEachIndex({
      dataSource,
      workspaceId,
      indexes: missingIndexes,
      apply: async ({ queryRunner, schemaName, tableName, index }) => {
        await this.dropIndexIfInvalid({
          queryRunner,
          schemaName,
          indexName: index.name,
        });
        await this.workspaceSchemaManagerService.indexManager.createIndex({
          queryRunner,
          schemaName,
          tableName,
          index: {
            name: index.name,
            columns: POSITION_ID_INDEX_FIELD_NAMES,
            isUnique: false,
            type: index.indexType,
          },
          concurrently: true,
        });
      },
    });

    for (const [
      applicationUniversalIdentifier,
      applicationIndexes,
    ] of Object.entries(
      groupBy(
        missingIndexes.map(
          ({ universalFlatIndexMetadata }) => universalFlatIndexMetadata,
        ),
        'applicationUniversalIdentifier',
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
    if (!isDefined(dataSource)) {
      this.logger.log(`No data source for workspace ${workspaceId}, skipping`);

      return;
    }

    const { positionIdIndexes, flatIndexMaps } =
      await this.loadPositionIdIndexes(workspaceId);
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

    // Dropped concurrently first so the metadata migration's DROP INDEX IF
    // EXISTS finds nothing and takes no lock; this also covers indexes left
    // by an up interrupted before its metadata sync
    await this.forEachIndex({
      dataSource,
      workspaceId,
      indexes: positionIdIndexes,
      apply: ({ queryRunner, schemaName, index }) =>
        this.workspaceSchemaManagerService.indexManager.dropIndex({
          queryRunner,
          schemaName,
          indexName: index.name,
          concurrently: true,
        }),
    });

    for (const [
      applicationUniversalIdentifier,
      applicationIndexes,
    ] of Object.entries(
      groupBy(existingIndexes, 'applicationUniversalIdentifier'),
    )) {
      await this.runIndexMigration({
        workspaceId,
        applicationUniversalIdentifier,
        flatEntityToCreate: [],
        flatEntityToDelete: applicationIndexes,
      });
    }
  }

  private async loadPositionIdIndexes(workspaceId: string) {
    const { flatObjectMetadataMaps, flatFieldMetadataMaps, flatIndexMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatObjectMetadataMaps',
        'flatFieldMetadataMaps',
        'flatIndexMaps',
      ]);

    return {
      positionIdIndexes: buildPositionIdIndexes({
        flatObjectMetadataMaps,
        flatFieldMetadataMaps,
        now: new Date().toISOString(),
      }),
      flatIndexMaps,
    };
  }

  private async forEachIndex({
    dataSource,
    workspaceId,
    indexes,
    apply,
  }: {
    dataSource: DataSource;
    workspaceId: string;
    indexes: PositionIdIndex[];
    apply: (args: {
      queryRunner: QueryRunner;
      schemaName: string;
      tableName: string;
      index: UniversalFlatIndexMetadata;
    }) => Promise<void>;
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

        await apply({
          queryRunner,
          schemaName,
          tableName,
          index: universalFlatIndexMetadata,
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
