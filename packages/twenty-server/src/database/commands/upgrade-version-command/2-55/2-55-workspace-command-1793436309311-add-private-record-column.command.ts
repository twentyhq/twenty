import { Command } from 'nest-commander';
import { MetadataReadability } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { type QueryRunner } from 'typeorm';

import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { IS_PRIVATE_COLUMN_DEFINITION } from 'src/engine/core-modules/record-share/constants/is-private-column-definition.constant';
import { IS_PRIVATE_COLUMN_NAME } from 'src/engine/core-modules/record-share/constants/private-record-column-names.constant';
import { hasIsPrivateColumn } from 'src/engine/core-modules/record-share/utils/has-is-private-column.util';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { WorkspaceSchemaManagerService } from 'src/engine/twenty-orm/workspace-schema-manager/workspace-schema-manager.service';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { getWorkspaceSchemaContextForMigration } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/utils/get-workspace-schema-context-for-migration.util';
import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';
import { escapeIdentifier } from 'src/engine/workspace-manager/workspace-migration/utils/remove-sql-injection.util';

// Objects whose records could be restricted by an everyone row before records became private one by one
const isRestrictableObject = (
  flatObjectMetadata: Pick<FlatObjectMetadata, 'readability' | 'isSystem'>,
): boolean =>
  flatObjectMetadata.readability !== MetadataReadability.PRIVATE &&
  !flatObjectMetadata.isSystem;

@RegisteredWorkspaceCommand('2.55.0', 1793436309311)
@Command({
  name: 'upgrade:2-55:add-private-record-column',
  description:
    'Add the _isPrivate column to every object table except recordShare and accessGroup, then turn records restricted to the people with access into private records',
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
    let dryRunPrivateRecordCount = 0;

    try {
      await queryRunner.connect();
      isQueryRunnerConnected = true;

      const tableNamesWithColumn = await this.findTableNamesWithColumn({
        queryRunner,
        schemaName,
      });
      const existingTableNames = await this.findTableNames({
        queryRunner,
        schemaName,
      });
      const restrictedRecordCountsByObjectMetadataId = options.dryRun
        ? await this.countRestrictedRecordsByObjectMetadataId({
            queryRunner,
            schemaName,
          })
        : undefined;

      for (const flatObjectMetadata of Object.values(
        flatObjectMetadataMaps.byUniversalIdentifier,
      ).filter(isDefined)) {
        if (!hasIsPrivateColumn(flatObjectMetadata)) {
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
          dryRunPrivateRecordCount += isRestrictableObject(flatObjectMetadata)
            ? (restrictedRecordCountsByObjectMetadataId?.get(
                flatObjectMetadata.id,
              ) ?? 0)
            : 0;

          continue;
        }

        if (!hasColumn) {
          await this.addColumnWithLockTimeout({
            queryRunner,
            schemaName,
            tableName,
          });
        }

        if (isRestrictableObject(flatObjectMetadata)) {
          await this.convertRestrictionsToPrivateRecords({
            queryRunner,
            schemaName,
            tableName,
            objectMetadataId: flatObjectMetadata.id,
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
        `[DRY RUN] Would add ${dryRunColumnCount} column(s) and make ${dryRunPrivateRecordCount} record(s) private for workspace ${workspaceId}`,
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
  }: {
    queryRunner: QueryRunner;
    schemaName: string;
    tableName: string;
  }): Promise<void> {
    await queryRunner.query(`SET lock_timeout = '8s'`);

    try {
      await this.workspaceSchemaManagerService.columnManager.addColumns({
        queryRunner,
        schemaName,
        tableName,
        columnDefinitions: [IS_PRIVATE_COLUMN_DEFINITION],
      });
    } finally {
      await queryRunner.query('RESET lock_timeout');
    }
  }

  private async countRestrictedRecordsByObjectMetadataId({
    queryRunner,
    schemaName,
  }: {
    queryRunner: QueryRunner;
    schemaName: string;
  }): Promise<Map<string, number>> {
    const counts: { objectMetadataId: string; count: string }[] =
      await queryRunner.query(
        `SELECT "objectMetadataId", COUNT(*) AS count FROM ${escapeIdentifier(schemaName)}."recordShare"
           WHERE "principalType" = 'EVERYONE' AND "rowCause" = 'MANUAL'
             AND "accessLevel" = 'NONE' AND "deletedAt" IS NULL
           GROUP BY "objectMetadataId"`,
      );

    return new Map(
      counts.map(({ objectMetadataId, count }) => [
        objectMetadataId,
        Number(count),
      ]),
    );
  }

  // "Anyone can view" has no private equivalent, so those records follow their roles again
  private async convertRestrictionsToPrivateRecords({
    queryRunner,
    schemaName,
    tableName,
    objectMetadataId,
  }: {
    queryRunner: QueryRunner;
    schemaName: string;
    tableName: string;
    objectMetadataId: string;
  }): Promise<void> {
    const recordShareTable = `${escapeIdentifier(schemaName)}."recordShare"`;

    await queryRunner.startTransaction();

    try {
      await queryRunner.query(
        `UPDATE ${escapeIdentifier(schemaName)}.${escapeIdentifier(tableName)}
           SET ${escapeIdentifier(IS_PRIVATE_COLUMN_NAME)} = true
           WHERE id IN (
             SELECT "recordId" FROM ${recordShareTable}
             WHERE "objectMetadataId" = $1 AND "principalType" = 'EVERYONE'
               AND "rowCause" = 'MANUAL' AND "accessLevel" = 'NONE' AND "deletedAt" IS NULL
           )`,
        [objectMetadataId],
      );
      await queryRunner.query(
        `DELETE FROM ${recordShareTable}
           WHERE "objectMetadataId" = $1 AND "principalType" = 'EVERYONE'
             AND "rowCause" = 'MANUAL' AND "accessLevel" IN ('NONE', 'READ')`,
        [objectMetadataId],
      );
      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();

      throw error;
    }
  }
}
