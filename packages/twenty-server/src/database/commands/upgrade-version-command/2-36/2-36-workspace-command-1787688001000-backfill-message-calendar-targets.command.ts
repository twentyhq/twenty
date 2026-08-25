import { Command } from 'nest-commander';

import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { buildMessageCalendarTargetBackfillQueries } from 'src/database/commands/upgrade-version-command/2-36/utils/build-message-calendar-target-backfill-queries.util';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';

const BACKFILL_BATCH_SIZE = 5_000;

@RegisteredWorkspaceCommand('2.36.0', 1787688001000)
@Command({
  name: 'upgrade:2-36:backfill-message-calendar-targets',
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
    if (!dataSource) {
      throw new Error('A data source is required to backfill target records');
    }

    const queries = buildMessageCalendarTargetBackfillQueries({
      batchSize: BACKFILL_BATCH_SIZE,
      schemaName: getWorkspaceSchemaName(workspaceId),
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
      let insertedCount = 0;
      let totalInsertedCount = 0;

      do {
        const [insertedRows] = await dataSource.query<
          [Array<{ id: string }>, number]
        >(query.insertSql);

        insertedCount = insertedRows.length;
        totalInsertedCount += insertedCount;
      } while (insertedCount === BACKFILL_BATCH_SIZE);

      this.logger.log(
        `Created ${totalInsertedCount} ${query.label} for workspace ${workspaceId}`,
      );
    }
  }
}
