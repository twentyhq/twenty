import { Command } from 'nest-commander';
import { FeatureFlagKey } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
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

type ChatTable = { tableName: string; objectMetadataId: string };

const EVERYONE_MANUAL_SHARE_CONDITION = `"principalType" = 'EVERYONE' AND "rowCause" = 'MANUAL' AND "deletedAt" IS NULL`;

@RegisteredWorkspaceCommand('2.55.0', 1793460623155)
@Command({
  name: 'upgrade:2-55:make-chat-threads-private-records',
  description:
    'Make chat threads and their participants private records, except those shared with everyone, and create them private from now on',
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

    const { flatObjectMetadataMaps, featureFlagsMap } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatObjectMetadataMaps',
        'featureFlagsMap',
      ]);

    // A rerun must not make private again a chat someone shared with everyone since
    if (featureFlagsMap[FeatureFlagKey.IS_PRIVATE_CHAT_THREAD_ENABLED]) {
      return;
    }

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
      const chatTables: ChatTable[] = Object.values(
        flatObjectMetadataMaps.byUniversalIdentifier,
      )
        .filter(isDefined)
        .filter(isPrivateByDefaultObject)
        .map((flatObjectMetadata) => ({
          tableName: getWorkspaceSchemaContextForMigration({
            workspaceId,
            objectMetadata: flatObjectMetadata,
          }).tableName,
          objectMetadataId: flatObjectMetadata.id,
        }))
        .filter(({ tableName }) => tableNamesWithColumn.has(tableName));

      if (options.dryRun) {
        await this.logDryRun({
          queryRunner,
          schemaName,
          workspaceId,
          chatTables,
        });

        return;
      }

      await this.convertChatTables({
        queryRunner,
        schemaName,
        workspaceId,
        chatTables,
      });
    } finally {
      if (isQueryRunnerConnected) {
        await queryRunner.release();
      }
    }

    await this.workspaceCacheService.invalidateAndRecompute(workspaceId, [
      'featureFlagsMap',
    ]);
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

  private async logDryRun({
    queryRunner,
    schemaName,
    workspaceId,
    chatTables,
  }: {
    queryRunner: QueryRunner;
    schemaName: string;
    workspaceId: string;
    chatTables: ChatTable[];
  }): Promise<void> {
    for (const { tableName, objectMetadataId } of chatTables) {
      const [{ privateCount, sharedWithEveryoneCount }] =
        await queryRunner.query(
          `SELECT
             COUNT(*) FILTER (WHERE NOT ${this.buildSharedWithEveryoneCondition(schemaName)}) AS "privateCount",
             COUNT(*) FILTER (WHERE ${this.buildSharedWithEveryoneCondition(schemaName)}) AS "sharedWithEveryoneCount"
           FROM ${escapeIdentifier(schemaName)}.${escapeIdentifier(tableName)} AS chat_record`,
          [objectMetadataId],
        );

      this.logger.log(
        `[DRY RUN] Would make ${privateCount} ${tableName} record(s) private and leave ${sharedWithEveryoneCount} shared with everyone to their roles for workspace ${workspaceId}`,
      );
    }
  }

  private buildSharedWithEveryoneCondition(schemaName: string): string {
    return `EXISTS (
      SELECT 1 FROM ${escapeIdentifier(schemaName)}."recordShare" everyone_share
      WHERE everyone_share."objectMetadataId" = $1 AND everyone_share."recordId" = chat_record.id
        AND everyone_share."accessLevel" IN ('READ', 'READ_WRITE', 'FULL')
        AND everyone_share.${EVERYONE_MANUAL_SHARE_CONDITION}
    )`;
  }

  // One transaction, so the flag only turns on once every chat table is converted
  private async convertChatTables({
    queryRunner,
    schemaName,
    workspaceId,
    chatTables,
  }: {
    queryRunner: QueryRunner;
    schemaName: string;
    workspaceId: string;
    chatTables: ChatTable[];
  }): Promise<void> {
    await queryRunner.startTransaction();

    try {
      await queryRunner.query(`SET LOCAL lock_timeout = '8s'`);

      for (const { tableName, objectMetadataId } of chatTables) {
        const table = `${escapeIdentifier(schemaName)}.${escapeIdentifier(tableName)}`;

        await queryRunner.query(
          `ALTER TABLE ${table} ALTER COLUMN ${escapeIdentifier(IS_PRIVATE_COLUMN_NAME)} SET DEFAULT true`,
        );
        await queryRunner.query(
          `UPDATE ${table} AS chat_record
             SET ${escapeIdentifier(IS_PRIVATE_COLUMN_NAME)} = NOT ${this.buildSharedWithEveryoneCondition(schemaName)}`,
          [objectMetadataId],
        );
        await queryRunner.query(
          `DELETE FROM ${escapeIdentifier(schemaName)}."recordShare"
             WHERE "objectMetadataId" = $1 AND ${EVERYONE_MANUAL_SHARE_CONDITION}`,
          [objectMetadataId],
        );
      }

      await queryRunner.query(
        `INSERT INTO core."featureFlag" ("workspaceId", key, value)
           SELECT $1, key, true FROM unnest($2::text[]) AS key
           ON CONFLICT ("workspaceId", key) DO UPDATE SET value = true`,
        [
          workspaceId,
          [
            FeatureFlagKey.IS_PRIVATE_RECORD_ENABLED,
            FeatureFlagKey.IS_PRIVATE_CHAT_THREAD_ENABLED,
          ],
        ],
      );
      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();

      throw error;
    }
  }
}
