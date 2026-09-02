import { Command } from 'nest-commander';
import { isDefined } from 'twenty-shared/utils';

import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { buildMessageCalendarTargetBackfillQueries } from 'src/database/commands/upgrade-version-command/2-37/utils/build-message-calendar-target-backfill-queries.util';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import {
  MESSAGE_CALENDAR_TARGET_BACKFILL_TIMESTAMP,
  MESSAGE_CALENDAR_TARGET_MIGRATION_VERSION,
} from 'src/engine/core-modules/target/constants/message-calendar-target-migration.constants';
import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';

const BACKFILL_BATCH_SIZE = 5_000;

@RegisteredWorkspaceCommand(
  MESSAGE_CALENDAR_TARGET_MIGRATION_VERSION,
  MESSAGE_CALENDAR_TARGET_BACKFILL_TIMESTAMP,
)
@Command({
  name: 'upgrade:2-37:backfill-message-calendar-targets',
  description:
    'Backfill message and calendar target junctions without emitting record events',
})
export class BackfillMessageCalendarTargetsCommand extends ProvisionedWorkspaceCommandRunner {
  constructor(
    protected readonly workspaceIteratorService: WorkspaceIteratorService,
  ) {
    super(workspaceIteratorService);
  }

  override async runOnWorkspace({
    workspaceId,
    options,
    dataSource,
  }: RunOnWorkspaceArgs): Promise<void> {
    if (!isDefined(dataSource)) {
      this.logger.warn(
        `Skipping message and calendar target backfill for workspace ${workspaceId}: no workspace data source`,
      );

      return;
    }

    const schemaName = getWorkspaceSchemaName(workspaceId);
    const [targetTables] = await dataSource.query<
      Array<{
        calendarEventTarget: string | null;
        messageThreadTarget: string | null;
      }>
    >(
      `SELECT
        to_regclass($1) AS "calendarEventTarget",
        to_regclass($2) AS "messageThreadTarget"`,
      [
        `"${schemaName}"."calendarEventTarget"`,
        `"${schemaName}"."messageThreadTarget"`,
      ],
    );

    if (
      !isDefined(targetTables?.calendarEventTarget) ||
      !isDefined(targetTables.messageThreadTarget)
    ) {
      this.logger.warn(
        `Skipping message and calendar target backfill for workspace ${workspaceId}: target tables are not provisioned`,
      );

      return;
    }

    const queries = buildMessageCalendarTargetBackfillQueries({
      batchSize: BACKFILL_BATCH_SIZE,
      schemaName,
    });

    if (options.dryRun) {
      for (const query of queries) {
        const [result] = await dataSource.query<Array<{ count: number }>>(
          query.countSql,
        );

        this.logger.log(
          `[DRY RUN] Would create ${result?.count ?? 0} ${query.label} for workspace ${workspaceId}`,
        );
      }

      return;
    }

    for (const query of queries) {
      let candidateCount = 0;
      let totalInsertedCount = 0;

      do {
        const [result] = await dataSource.query<
          Array<{ candidateCount: number; insertedCount: number }>
        >(query.insertSql);

        candidateCount = result?.candidateCount ?? 0;
        totalInsertedCount += result?.insertedCount ?? 0;
      } while (candidateCount === BACKFILL_BATCH_SIZE);

      this.logger.log(
        `Created ${totalInsertedCount} ${query.label} for workspace ${workspaceId}`,
      );
    }
  }
}
