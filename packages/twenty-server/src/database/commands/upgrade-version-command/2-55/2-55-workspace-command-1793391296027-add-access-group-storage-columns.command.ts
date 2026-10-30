import { Command } from 'nest-commander';
import { isDefined } from 'twenty-shared/utils';
import { type QueryRunner } from 'typeorm';

import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { buildAccessGroupSchemaDefinitions } from 'src/engine/metadata-modules/access-group/utils/build-access-group-schema-definitions.util';
import { WorkspaceSchemaManagerService } from 'src/engine/twenty-orm/workspace-schema-manager/workspace-schema-manager.service';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { getWorkspaceSchemaContextForMigration } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/utils/get-workspace-schema-context-for-migration.util';
import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';

@RegisteredWorkspaceCommand('2.55.0', 1793391296027)
@Command({
  name: 'upgrade:2-55:add-access-group-storage-columns',
  description:
    'Add the readable and writable access group id columns to every object table and the compact id to accessGroup. Indexes are created with CONCURRENTLY so writes are not blocked.',
})
export class AddAccessGroupStorageColumnsCommand extends ProvisionedWorkspaceCommandRunner {
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

    try {
      await queryRunner.connect();
      isQueryRunnerConnected = true;

      const existingColumnNamesByTableName =
        await this.findExistingColumnNamesByTableName({
          queryRunner,
          schemaName,
        });

      for (const flatObjectMetadata of Object.values(
        flatObjectMetadataMaps.byUniversalIdentifier,
      ).filter(isDefined)) {
        const { tableName } = getWorkspaceSchemaContextForMigration({
          workspaceId,
          objectMetadata: flatObjectMetadata,
        });
        const existingColumnNames =
          existingColumnNamesByTableName.get(tableName);

        if (!isDefined(existingColumnNames)) {
          continue;
        }

        const { columnDefinitions, indexDefinitions } =
          buildAccessGroupSchemaDefinitions({
            objectMetadata: flatObjectMetadata,
          });
        const missingColumnDefinitions = columnDefinitions.filter(
          (columnDefinition) => !existingColumnNames.has(columnDefinition.name),
        );

        if (options.dryRun) {
          this.logger.log(
            `[DRY RUN] Would add ${missingColumnDefinitions.length} column(s) and ensure ${indexDefinitions.length} index(es) on ${tableName} for workspace ${workspaceId}`,
          );

          continue;
        }

        // A constant default is stored in the catalog, so this does not rewrite the table
        await this.workspaceSchemaManagerService.columnManager.addColumns({
          queryRunner,
          schemaName,
          tableName,
          columnDefinitions: missingColumnDefinitions,
        });

        await this.dropInvalidIndexes({
          queryRunner,
          schemaName,
          indexNames: indexDefinitions.map((index) => index.name),
        });

        for (const index of indexDefinitions) {
          await this.workspaceSchemaManagerService.indexManager.createIndex({
            queryRunner,
            schemaName,
            tableName,
            index,
            concurrently: true,
          });
        }
      }
    } finally {
      if (isQueryRunnerConnected) {
        await queryRunner.release();
      }
    }
  }

  private async findExistingColumnNamesByTableName({
    queryRunner,
    schemaName,
  }: {
    queryRunner: QueryRunner;
    schemaName: string;
  }): Promise<Map<string, Set<string>>> {
    const columns: { tableName: string; columnName: string }[] =
      await queryRunner.query(
        `SELECT table_name AS "tableName", column_name AS "columnName"
         FROM information_schema.columns
         WHERE table_schema = $1`,
        [schemaName],
      );

    const existingColumnNamesByTableName = new Map<string, Set<string>>();

    for (const { tableName, columnName } of columns) {
      existingColumnNamesByTableName.set(
        tableName,
        (existingColumnNamesByTableName.get(tableName) ?? new Set()).add(
          columnName,
        ),
      );
    }

    return existingColumnNamesByTableName;
  }

  // An interrupted CREATE INDEX CONCURRENTLY leaves an invalid index that IF NOT EXISTS would keep
  private async dropInvalidIndexes({
    queryRunner,
    schemaName,
    indexNames,
  }: {
    queryRunner: QueryRunner;
    schemaName: string;
    indexNames: string[];
  }): Promise<void> {
    const invalidIndexes: { name: string }[] = await queryRunner.query(
      `SELECT c.relname AS name
       FROM pg_index i
       JOIN pg_class c ON c.oid = i.indexrelid
       JOIN pg_namespace n ON n.oid = c.relnamespace
       WHERE n.nspname = $1 AND c.relname = ANY($2) AND NOT i.indisvalid`,
      [schemaName, indexNames],
    );

    for (const { name } of invalidIndexes) {
      await this.workspaceSchemaManagerService.indexManager.dropIndex({
        queryRunner,
        schemaName,
        indexName: name,
      });
    }
  }
}
