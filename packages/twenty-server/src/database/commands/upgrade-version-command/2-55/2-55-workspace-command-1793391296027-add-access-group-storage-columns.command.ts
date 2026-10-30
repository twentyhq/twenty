import { Command } from 'nest-commander';
import { isDefined } from 'twenty-shared/utils';
import { type QueryRunner } from 'typeorm';

import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { ACCESS_GROUP_COMPACT_ID_COLUMN_DEFINITION } from 'src/engine/metadata-modules/access-group/constants/access-group-compact-id-column-definition.constant';
import { ACCESS_GROUP_COMPACT_ID_INDEX_DEFINITION } from 'src/engine/metadata-modules/access-group/constants/access-group-compact-id-index-definition.constant';
import { ACCESS_GROUP_IDS_COLUMN_DEFINITION } from 'src/engine/metadata-modules/access-group/constants/access-group-ids-column-definition.constant';
import { buildAccessGroupIdsIndexDefinition } from 'src/engine/metadata-modules/access-group/utils/build-access-group-ids-index-definition.util';
import { isAccessGroupObject } from 'src/engine/metadata-modules/access-group/utils/is-access-group-object.util';
import { type WorkspaceSchemaColumnDefinition } from 'src/engine/twenty-orm/workspace-schema-manager/types/workspace-schema-column-definition.type';
import { WorkspaceSchemaManagerService } from 'src/engine/twenty-orm/workspace-schema-manager/workspace-schema-manager.service';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { getWorkspaceSchemaContextForMigration } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/utils/get-workspace-schema-context-for-migration.util';
import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';

@RegisteredWorkspaceCommand('2.55.0', 1793391296027)
@Command({
  name: 'upgrade:2-55:add-access-group-storage-columns',
  description:
    'Add the access group ids column to every object table and the compact id to accessGroup. Indexes are created with CONCURRENTLY so writes are not blocked.',
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
    let dryRunColumnCount = 0;
    let dryRunTableCount = 0;
    const queryRunner = dataSource.createQueryRunner('master');
    let isQueryRunnerConnected = false;

    try {
      await queryRunner.connect();
      isQueryRunnerConnected = true;

      const existingColumnTypesByTableName =
        await this.findExistingColumnTypesByTableName({
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
        const existingColumnTypes =
          existingColumnTypesByTableName.get(tableName);

        if (!isDefined(existingColumnTypes)) {
          continue;
        }

        const isAccessGroup = isAccessGroupObject(flatObjectMetadata);
        const columnDefinition = isAccessGroup
          ? ACCESS_GROUP_COMPACT_ID_COLUMN_DEFINITION
          : ACCESS_GROUP_IDS_COLUMN_DEFINITION;
        const indexDefinition = isAccessGroup
          ? ACCESS_GROUP_COMPACT_ID_INDEX_DEFINITION
          : buildAccessGroupIdsIndexDefinition({
              objectMetadataId: flatObjectMetadata.id,
            });
        const existingColumnType = existingColumnTypes.get(
          columnDefinition.name,
        );
        const isColumnMissing = !isDefined(existingColumnType);

        if (
          !isColumnMissing &&
          existingColumnType !== (isAccessGroup ? 'int4' : '_int4')
        ) {
          this.logger.error(
            `Skipping ${tableName} in workspace ${workspaceId}: column ${columnDefinition.name} already exists with type ${existingColumnType}`,
          );

          continue;
        }

        if (options.dryRun) {
          dryRunColumnCount += isColumnMissing ? 1 : 0;
          dryRunTableCount++;

          continue;
        }

        if (isColumnMissing) {
          await this.addColumnWithLockTimeout({
            queryRunner,
            schemaName,
            tableName,
            columnDefinition,
          });
        }

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
    } finally {
      if (isQueryRunnerConnected) {
        await queryRunner.release();
      }
    }

    if (options.dryRun) {
      this.logger.log(
        `[DRY RUN] Would add ${dryRunColumnCount} column(s) and ensure indexes on ${dryRunTableCount} table(s) for workspace ${workspaceId}`,
      );
    }
  }

  private async findExistingColumnTypesByTableName({
    queryRunner,
    schemaName,
  }: {
    queryRunner: QueryRunner;
    schemaName: string;
  }): Promise<Map<string, Map<string, string>>> {
    const columns: {
      tableName: string;
      columnName: string;
      udtName: string;
    }[] = await queryRunner.query(
      `SELECT table_name AS "tableName", column_name AS "columnName", udt_name AS "udtName"
         FROM information_schema.columns
         WHERE table_schema = $1`,
      [schemaName],
    );

    const existingColumnTypesByTableName = new Map<
      string,
      Map<string, string>
    >();

    for (const { tableName, columnName, udtName } of columns) {
      existingColumnTypesByTableName.set(
        tableName,
        (existingColumnTypesByTableName.get(tableName) ?? new Map()).set(
          columnName,
          udtName,
        ),
      );
    }

    return existingColumnTypesByTableName;
  }

  // Fail fast instead of queueing every query on the table behind the exclusive lock
  private async addColumnWithLockTimeout({
    queryRunner,
    schemaName,
    tableName,
    columnDefinition,
  }: {
    queryRunner: QueryRunner;
    schemaName: string;
    tableName: string;
    columnDefinition: WorkspaceSchemaColumnDefinition;
  }): Promise<void> {
    await queryRunner.query(`SET lock_timeout = '8s'`);

    try {
      await this.workspaceSchemaManagerService.columnManager.addColumns({
        queryRunner,
        schemaName,
        tableName,
        columnDefinitions: [columnDefinition],
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
      });
    }
  }
}
