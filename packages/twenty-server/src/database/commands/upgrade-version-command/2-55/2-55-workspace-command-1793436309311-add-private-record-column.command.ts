import { Command } from 'nest-commander';
import { isDefined } from 'twenty-shared/utils';
import { type QueryRunner } from 'typeorm';

import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { IS_PRIVATE_COLUMN_NAME } from 'src/engine/permissions/private-record/constants/is-private-column-name.constant';
import { enrichRecordTableSchemaWithIsPrivate } from 'src/engine/permissions/private-record/utils/enrich-record-table-schema-with-is-private.util';
import { type WorkspaceSchemaIndexDefinition } from 'src/engine/twenty-orm/workspace-schema-manager/types/workspace-schema-index-definition.type';
import { WorkspaceSchemaManagerService } from 'src/engine/twenty-orm/workspace-schema-manager/workspace-schema-manager.service';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';
import { getWorkspaceSchemaContextForMigration } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/utils/get-workspace-schema-context-for-migration.util';

// Below this, a plain index build takes milliseconds, so it skips the database-wide waits of CONCURRENTLY
const CONCURRENT_INDEX_MIN_TABLE_SIZE_IN_BYTES = 8 * 1024 * 1024;

type TableState = {
  sizeInBytes: number;
  hasColumn: boolean;
};

@RegisteredWorkspaceCommand('2.55.0', 1793436309311)
@Command({
  name: 'upgrade:2-55:add-private-record-column',
  description:
    'Add the _isPrivate column and its partial index to every object table except recordShare and accessGroup. Large tables get their index with CONCURRENTLY.',
})
export class AddPrivateRecordColumnCommand extends ProvisionedWorkspaceCommandRunner {
  constructor(
    protected readonly workspaceIteratorService: WorkspaceIteratorService,
    private readonly workspaceCacheService: WorkspaceCacheService,
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

    const { flatObjectMetadataMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatObjectMetadataMaps',
      ]);

    const schemaName = getWorkspaceSchemaName(workspaceId);
    const tableSchemas = Object.values(
      flatObjectMetadataMaps.byUniversalIdentifier,
    )
      .filter(isDefined)
      .map((flatObjectMetadata) => ({
        tableName: getWorkspaceSchemaContextForMigration({
          workspaceId,
          objectMetadata: flatObjectMetadata,
        }).tableName,
        ...enrichRecordTableSchemaWithIsPrivate({
          objectMetadata: flatObjectMetadata,
          tableSchema: { columnDefinitions: [], indexDefinitions: [] },
        }),
      }))
      .filter(({ columnDefinitions }) => columnDefinitions.length > 0);

    const queryRunner = dataSource.createQueryRunner('master');
    let isQueryRunnerConnected = false;
    let dryRunTableCount = 0;

    try {
      await queryRunner.connect();
      isQueryRunnerConnected = true;

      const tableStates = await this.findTableStates({
        queryRunner,
        schemaName,
        tableNames: tableSchemas.map(({ tableName }) => tableName),
      });
      const indexValidityByName = await this.findIndexValidityByName({
        queryRunner,
        schemaName,
        indexNames: tableSchemas.flatMap(({ indexDefinitions }) =>
          indexDefinitions.map(({ name }) => name),
        ),
      });

      for (const {
        tableName,
        columnDefinitions,
        indexDefinitions,
      } of tableSchemas) {
        const tableState = tableStates.get(tableName);

        if (!isDefined(tableState)) {
          continue;
        }

        const missingColumnDefinitions = tableState.hasColumn
          ? []
          : columnDefinitions;
        const missingIndexDefinitions = indexDefinitions.filter(
          ({ name }) => indexValidityByName.get(name) !== true,
        );

        if (
          missingColumnDefinitions.length === 0 &&
          missingIndexDefinitions.length === 0
        ) {
          continue;
        }

        if (options.dryRun) {
          dryRunTableCount++;

          continue;
        }


        await this.workspaceSchemaManagerService.columnManager.addColumns({
          queryRunner,
          schemaName,
          tableName,
          columnDefinitions: missingColumnDefinitions,
        });
        await this.createIndexes({
          queryRunner,
          schemaName,
          tableName,
          indexDefinitions: missingIndexDefinitions,
          indexValidityByName,
          concurrently:
            tableState.sizeInBytes >= CONCURRENT_INDEX_MIN_TABLE_SIZE_IN_BYTES,
        });
      }
    } finally {
      if (isQueryRunnerConnected) {
        await queryRunner.release();
      }
    }

    if (options.dryRun) {
      this.logger.log(
        `[DRY RUN] Would update ${dryRunTableCount} table(s) for workspace ${workspaceId}`,
      );
    }
  }

  // An interrupted CREATE INDEX CONCURRENTLY leaves an invalid index that IF NOT EXISTS would keep
  private async createIndexes({
    queryRunner,
    schemaName,
    tableName,
    indexDefinitions,
    indexValidityByName,
    concurrently,
  }: {
    queryRunner: QueryRunner;
    schemaName: string;
    tableName: string;
    indexDefinitions: WorkspaceSchemaIndexDefinition[];
    indexValidityByName: Map<string, boolean>;
    concurrently: boolean;
  }): Promise<void> {
    for (const indexDefinition of indexDefinitions) {
      if (indexValidityByName.get(indexDefinition.name) === false) {
        await this.workspaceSchemaManagerService.indexManager.dropIndex({
          queryRunner,
          schemaName,
          indexName: indexDefinition.name,
          concurrently,
        });
      }

      await this.workspaceSchemaManagerService.indexManager.createIndex({
        queryRunner,
        schemaName,
        tableName,
        index: indexDefinition,
        concurrently,
      });
    }
  }

  // pg_catalog lookups by name stay on the catalog indexes, unlike information_schema scans per schema
  private async findTableStates({
    queryRunner,
    schemaName,
    tableNames,
  }: {
    queryRunner: QueryRunner;
    schemaName: string;
    tableNames: string[];
  }): Promise<Map<string, TableState>> {
    const tables: {
      tableName: string;
      sizeInBytes: string;
      hasColumn: boolean;
    }[] = await queryRunner.query(
      `SELECT c.relname AS "tableName",
              pg_relation_size(c.oid) AS "sizeInBytes",
              EXISTS (
                SELECT 1 FROM pg_attribute a
                WHERE a.attrelid = c.oid AND a.attname = $3 AND NOT a.attisdropped
              ) AS "hasColumn"
       FROM pg_class c
       JOIN pg_namespace n ON n.oid = c.relnamespace
       WHERE n.nspname = $1 AND c.relname = ANY($2) AND c.relkind IN ('r', 'p')`,
      [schemaName, tableNames, IS_PRIVATE_COLUMN_NAME],
    );

    return new Map(
      tables.map(({ tableName, sizeInBytes, hasColumn }) => [
        tableName,
        { sizeInBytes: Number(sizeInBytes), hasColumn },
      ]),
    );
  }

  private async findIndexValidityByName({
    queryRunner,
    schemaName,
    indexNames,
  }: {
    queryRunner: QueryRunner;
    schemaName: string;
    indexNames: string[];
  }): Promise<Map<string, boolean>> {
    const indexes: { indexName: string; isValid: boolean }[] =
      await queryRunner.query(
        `SELECT c.relname AS "indexName", i.indisvalid AS "isValid"
         FROM pg_class c
         JOIN pg_namespace n ON n.oid = c.relnamespace
         JOIN pg_index i ON i.indexrelid = c.oid
         WHERE n.nspname = $1 AND c.relname = ANY($2)`,
        [schemaName, indexNames],
      );

    return new Map(
      indexes.map(({ indexName, isValid }) => [indexName, isValid]),
    );
  }
}
