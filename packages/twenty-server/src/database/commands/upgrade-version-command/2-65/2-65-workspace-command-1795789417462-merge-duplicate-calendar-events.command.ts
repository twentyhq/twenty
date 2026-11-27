import chunk from 'lodash.chunk';
import { Command } from 'nest-commander';
import { ConnectedAccountProvider } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { buildCalendarEventDuplicatePairsQuery } from 'src/database/commands/upgrade-version-command/2-65/utils/build-calendar-event-duplicate-pairs-query.util';
import { buildCalendarEventMergeQueries } from 'src/database/commands/upgrade-version-command/2-65/utils/build-calendar-event-merge-queries.util';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';

const MERGE_BATCH_SIZE = 500;

@RegisteredWorkspaceCommand('2.65.0', 1795789417462)
@Command({
  name: 'upgrade:2-65:merge-duplicate-calendar-events',
  description:
    'Merge calendar events synced once per channel into one shared event, without emitting record events',
})
export class MergeDuplicateCalendarEventsCommand extends ProvisionedWorkspaceCommandRunner {
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
        `Skipping calendar event merge for workspace ${workspaceId}: no workspace data source`,
      );

      return;
    }

    const schemaName = getWorkspaceSchemaName(workspaceId);
    const [tables] = await dataSource.query<Array<{ ready: boolean }>>(
      `SELECT to_regclass($1) IS NOT NULL
        AND to_regclass($2) IS NOT NULL
        AND to_regclass($3) IS NOT NULL
        AND to_regclass($4) IS NOT NULL
        AND to_regclass($5) IS NOT NULL
        AND to_regclass($6) IS NOT NULL AS ready`,
      [
        'calendarEvent',
        'calendarChannelEventAssociation',
        'calendarEventParticipant',
        'calendarEventTarget',
        'callRecording',
        'timelineActivity',
      ].map((tableName) => `"${schemaName}"."${tableName}"`),
    );

    if (!tables?.ready) {
      this.logger.warn(
        `Skipping calendar event merge for workspace ${workspaceId}: calendar tables are not provisioned`,
      );

      return;
    }

    const [{ hasChannelsSharingAProvider }] = await dataSource.query<
      Array<{ hasChannelsSharingAProvider: boolean }>
    >(
      `SELECT EXISTS (
        SELECT 1
        FROM core."calendarChannel" calendar_channel
        INNER JOIN core."connectedAccount" connected_account
          ON connected_account."id" = calendar_channel."connectedAccountId"
        WHERE calendar_channel."workspaceId" = $1
          AND connected_account."provider" IN ($2, $3)
        GROUP BY connected_account."provider"
        HAVING COUNT(*) > 1
      ) AS "hasChannelsSharingAProvider"`,
      [
        workspaceId,
        ConnectedAccountProvider.GOOGLE,
        ConnectedAccountProvider.MICROSOFT,
      ],
    );

    if (!hasChannelsSharingAProvider) {
      return;
    }

    const duplicatePairs = await dataSource.query<
      Array<{ duplicateId: string; keeperId: string }>
    >(buildCalendarEventDuplicatePairsQuery(schemaName), [workspaceId]);

    if (options.dryRun) {
      this.logger.log(
        `[DRY RUN] Would merge ${duplicatePairs.length} duplicate calendar events for workspace ${workspaceId}`,
      );

      return;
    }

    const queries = buildCalendarEventMergeQueries(schemaName);

    for (const batch of chunk(duplicatePairs, MERGE_BATCH_SIZE)) {
      const parameters = [
        batch.map(({ duplicateId }) => duplicateId),
        batch.map(({ keeperId }) => keeperId),
      ];

      await dataSource.transaction(async (entityManager) => {
        for (const query of queries) {
          await entityManager.query(query, parameters);
        }
      });
    }

    this.logger.log(
      `Merged ${duplicatePairs.length} duplicate calendar events for workspace ${workspaceId}`,
    );
  }
}
