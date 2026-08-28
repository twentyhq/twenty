import { Command } from 'nest-commander';
import { isDefined } from 'twenty-shared/utils';

import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { buildLinkedTimelineActivityHappensAtBackfillQueries } from 'src/database/commands/upgrade-version-command/2-38/utils/build-linked-timeline-activity-happens-at-backfill-queries.util';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

const BACKFILL_BATCH_SIZE = 5_000;

@RegisteredWorkspaceCommand('2.38.0', 1787914663665)
@Command({
  name: 'upgrade:2-38:backfill-linked-timeline-activity-happens-at',
  description:
    'Backfill timelineActivity.happensAt for message and calendar event linked activities from message.receivedAt and calendarEvent.startsAt',
})
export class BackfillLinkedTimelineActivityHappensAtCommand extends ProvisionedWorkspaceCommandRunner {
  constructor(
    protected readonly workspaceIteratorService: WorkspaceIteratorService,
    private readonly workspaceCacheService: WorkspaceCacheService,
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
        `Skipping linked timeline activity happensAt backfill for workspace ${workspaceId}: no workspace data source`,
      );

      return;
    }

    const schemaName = getWorkspaceSchemaName(workspaceId);
    const [workspaceTables] = await dataSource.query<
      Array<{
        timelineActivity: string | null;
        message: string | null;
        calendarEvent: string | null;
      }>
    >(
      `SELECT
        to_regclass($1) AS "timelineActivity",
        to_regclass($2) AS "message",
        to_regclass($3) AS "calendarEvent"`,
      [
        `"${schemaName}"."timelineActivity"`,
        `"${schemaName}"."message"`,
        `"${schemaName}"."calendarEvent"`,
      ],
    );

    if (
      !isDefined(workspaceTables?.timelineActivity) ||
      !isDefined(workspaceTables.message) ||
      !isDefined(workspaceTables.calendarEvent)
    ) {
      this.logger.warn(
        `Skipping linked timeline activity happensAt backfill for workspace ${workspaceId}: tables are not provisioned`,
      );

      return;
    }

    const { flatTimelineActivityTypeMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatTimelineActivityTypeMaps',
      ]);

    const queries = buildLinkedTimelineActivityHappensAtBackfillQueries({
      schemaName,
      batchSize: BACKFILL_BATCH_SIZE,
      flatTimelineActivityTypes: Object.values(
        flatTimelineActivityTypeMaps.byUniversalIdentifier,
      ).filter(isDefined),
    });

    if (options.dryRun) {
      for (const query of queries) {
        const [result] = await dataSource.query<Array<{ count: number }>>(
          query.countSql,
          query.parameters,
        );

        this.logger.log(
          `[DRY RUN] Would rewrite happensAt on ${result?.count ?? 0} ${query.label} for workspace ${workspaceId}`,
        );
      }

      return;
    }

    for (const query of queries) {
      let backfilledRowCount = 0;
      let lastBatchRowCount = 0;

      // Each batch commits on its own and only ever picks rows still diverging
      // from their source timestamp, so an interrupted run resumes cleanly.
      do {
        const result = await dataSource.query(
          query.updateSql,
          query.parameters,
        );

        lastBatchRowCount = result?.[1] ?? 0;
        backfilledRowCount += lastBatchRowCount;
      } while (lastBatchRowCount === BACKFILL_BATCH_SIZE);

      this.logger.log(
        `Rewrote happensAt on ${backfilledRowCount} ${query.label} for workspace ${workspaceId}`,
      );
    }
  }
}
