import { Command } from 'nest-commander';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';
import { type QueryRunner } from 'typeorm';

import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { IS_PRIVATE_COLUMN_NAME } from 'src/engine/permissions/private-record/constants/is-private-column-name.constant';
import { isPrivateByDefaultObject } from 'src/engine/permissions/private-record/utils/is-private-by-default-object.util';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';
import { escapeIdentifier } from 'src/engine/workspace-manager/workspace-migration/utils/remove-sql-injection.util';
import { getWorkspaceSchemaContextForMigration } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/utils/get-workspace-schema-context-for-migration.util';

@RegisteredWorkspaceCommand('2.55.0', 1793460623155)
@Command({
  name: 'upgrade:2-55:make-chat-threads-private-records',
  description: 'Make every chat thread and chat participant a private record',
})
export class MakeChatThreadsPrivateRecordsCommand extends ProvisionedWorkspaceCommandRunner {
  constructor(
    protected readonly workspaceIteratorService: WorkspaceIteratorService,
    private readonly workspaceCacheService: WorkspaceCacheService,
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

      const tableNamesWithColumn = await this.findTableNamesWithColumn({
        queryRunner,
        schemaName,
      });
      const chatTableExpressions = Object.values(
        flatObjectMetadataMaps.byUniversalIdentifier,
      )
        .filter(isDefined)
        .filter(isPrivateByDefaultObject)
        .map(
          (flatObjectMetadata) =>
            getWorkspaceSchemaContextForMigration({
              workspaceId,
              objectMetadata: flatObjectMetadata,
            }).tableName,
        )
        .filter((tableName) => tableNamesWithColumn.has(tableName))
        .map(
          (tableName) =>
            `${escapeIdentifier(schemaName)}.${escapeIdentifier(tableName)}`,
        );

      if (!isNonEmptyArray(chatTableExpressions)) {
        return;
      }

      const isPrivateColumn = escapeIdentifier(IS_PRIVATE_COLUMN_NAME);

      if (options.dryRun) {
        const [{ count }] = await queryRunner.query(
          `SELECT ${chatTableExpressions
            .map(
              (tableExpression) =>
                `(SELECT COUNT(*) FROM ${tableExpression} WHERE NOT ${isPrivateColumn})`,
            )
            .join(' + ')} AS count`,
        );

        this.logger.log(
          `[DRY RUN] Would make ${count} chat record(s) private for workspace ${workspaceId}`,
        );

        return;
      }

      for (const tableExpression of chatTableExpressions) {
        await queryRunner.query(
          `UPDATE ${tableExpression} SET ${isPrivateColumn} = true WHERE NOT ${isPrivateColumn}`,
        );
      }
    } finally {
      if (isQueryRunnerConnected) {
        await queryRunner.release();
      }
    }
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
}
