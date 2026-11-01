import { Command } from 'nest-commander';
import { isDefined } from 'twenty-shared/utils';
import { type QueryRunner } from 'typeorm';

import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { IS_PRIVATE_COLUMN_NAME } from 'src/engine/permissions/private-record/constants/is-private-column-name.constant';
import { enrichRecordTableSchemaWithIsPrivate } from 'src/engine/permissions/private-record/utils/enrich-record-table-schema-with-is-private.util';
import { type WorkspaceSchemaColumnDefinition } from 'src/engine/twenty-orm/workspace-schema-manager/types/workspace-schema-column-definition.type';
import { WorkspaceSchemaManagerService } from 'src/engine/twenty-orm/workspace-schema-manager/workspace-schema-manager.service';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';
import { getWorkspaceSchemaContextForMigration } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/utils/get-workspace-schema-context-for-migration.util';

@RegisteredWorkspaceCommand('2.55.0', 1793436309311)
@Command({
  name: 'upgrade:2-55:add-private-record-column',
  description:
    'Add the _isPrivate column and its partial index to every object table except recordShare and accessGroup. Indexes are created with CONCURRENTLY so writes are not blocked.',
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
    const queryRunner = dataSource.createQueryRunner('master');
    let isQueryRunnerConnected = false;
    let dryRunColumnCount = 0;

    try {
      await queryRunner.connect();
      isQueryRunnerConnected = true;

      const existingTableNames = await this.findTableNames({
        queryRunner,
        schemaName,
      });
      const tableNamesWithColumn = await this.findTableNamesWithColumn({
        queryRunner,
        schemaName,
      });

      for (const flatObjectMetadata of Object.values(
        flatObjectMetadataMaps.byUniversalIdentifier,
      ).filter(isDefined)) {
        const { columnDefinitions, indexDefinitions } =
          enrichRecordTableSchemaWithIsPrivate({
            objectMetadata: flatObjectMetadata,
            tableSchema: { columnDefinitions: [], indexDefinitions: [] },
          });

        if (columnDefinitions.length === 0) {
          continue;
        }

        const { tableName } = getWorkspaceSchemaContextForMigration({
          workspaceId,
          objectMetadata: flatObjectMetadata,
        });

        if (!existingTableNames.has(tableName)) {
          continue;
        }

        const hasColumn = tableNamesWithColumn.has(tableName);

        if (options.dryRun) {
          dryRunColumnCount += hasColumn ? 0 : 1;

          continue;
        }

        if (!hasColumn) {
          await this.addColumnWithLockTimeout({
            queryRunner,
            schemaName,
            tableName,
            columnDefinitions,
          });
        }

        for (const indexDefinition of indexDefinitions) {
          await this.dropInvalidIndex({
            queryRunner,
            schemaName,
            indexName: indexDefinition.name,
          });
          await this.workspaceSchemaManagerService.indexManager.createIndex({
            queryRunner,
            schemaName,
            tableName,
            index: indexDefinition,
            concurrently: true,
          });
        }
      }
    } finally {
      if (isQueryRunnerConnected) {
        await queryRunner.release();
      }
    }

    if (options.dryRun) {
      this.logger.log(
        `[DRY RUN] Would add ${dryRunColumnCount} column(s) for workspace ${workspaceId}`,
      );
    }
  }

  private async findTableNames({
    queryRunner,
    schemaName,
  }: {
    queryRunner: QueryRunner;
    schemaName: string;
  }): Promise<Set<string>> {
    const tables: { tableName: string }[] = await queryRunner.query(
      `SELECT table_name AS "tableName" FROM information_schema.tables WHERE table_schema = $1`,
      [schemaName],
    );

    return new Set(tables.map(({ tableName }) => tableName));
  }

  private async findTableNamesWithColumn({
    queryRunner,
    schemaName,
  }: {
    queryRunner: QueryRunner;
    schemaName: string;
  }): Promise<Set<string>> {
    const columns: { tableName: string }[] = await queryRunner.query(
      `SELECT table_name AS "tableName" FROM information_schema.columns
         WHERE table_schema = $1 AND column_name = $2`,
      [schemaName, IS_PRIVATE_COLUMN_NAME],
    );

    return new Set(columns.map(({ tableName }) => tableName));
  }

  // Metadata-only, but the exclusive lock must not queue every query on the table
  private async addColumnWithLockTimeout({
    queryRunner,
    schemaName,
    tableName,
    columnDefinitions,
  }: {
    queryRunner: QueryRunner;
    schemaName: string;
    tableName: string;
    columnDefinitions: WorkspaceSchemaColumnDefinition[];
  }): Promise<void> {
    await queryRunner.query(`SET lock_timeout = '8s'`);

    try {
      await this.workspaceSchemaManagerService.columnManager.addColumns({
        queryRunner,
        schemaName,
        tableName,
        columnDefinitions,
      });
    } finally {
      await queryRunner.query('RESET lock_timeout');
    }
  }

  // An interrupted CREATE INDEX CONCURRENTLY leaves an invalid index that IF NOT EXISTS would keep
  private async dropInvalidIndex({
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

    for (const { name } of invalidIndexes) {
      await this.workspaceSchemaManagerService.indexManager.dropIndex({
        queryRunner,
        schemaName,
        indexName: name,
        concurrently: true,
      });
    }
  }
}
