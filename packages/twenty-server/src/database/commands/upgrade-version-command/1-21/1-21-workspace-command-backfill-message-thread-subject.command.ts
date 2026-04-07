import { Command } from 'nest-commander';

import { ActiveOrSuspendedWorkspaceCommandRunner } from 'src/database/commands/command-runners/active-or-suspended-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';

@Command({
  name: 'upgrade:1-21:backfill-message-thread-subject',
  description:
    'Backfill messageThread.subject from the most recently received message in each thread',
})
export class BackfillMessageThreadSubjectCommand extends ActiveOrSuspendedWorkspaceCommandRunner {
  constructor(
    protected readonly workspaceIteratorService: WorkspaceIteratorService,
  ) {
    super(workspaceIteratorService);
  }

  override async runOnWorkspace({
    workspaceId,
    dataSource,
    options,
  }: RunOnWorkspaceArgs): Promise<void> {
    if (!dataSource) {
      this.logger.log(`No data source for workspace ${workspaceId}, skipping`);

      return;
    }

    const schemaName = getWorkspaceSchemaName(workspaceId);

    if (options.dryRun) {
      this.logger.log(
        `[DRY RUN] Would backfill messageThread.subject for workspace ${workspaceId}`,
      );

      return;
    }

    const columnExists = await dataSource.query(
      `SELECT 1 FROM information_schema.columns
       WHERE table_schema = $1
         AND table_name = 'messageThread'
         AND column_name = 'subject'`,
      [schemaName],
      undefined,
      { shouldBypassPermissionChecks: true },
    );

    if (columnExists.length === 0) {
      this.logger.log(
        `Column "subject" does not exist yet on messageThread for workspace ${workspaceId}, skipping (will be created by sync-metadata)`,
      );

      return;
    }

    const result = await dataSource.query(
      `UPDATE "${schemaName}"."messageThread" mt
       SET "subject" = sub.subject
       FROM (
         SELECT DISTINCT ON ("messageThreadId") "messageThreadId", "subject"
         FROM "${schemaName}"."message"
         ORDER BY "messageThreadId", "receivedAt" DESC NULLS LAST
       ) sub
       WHERE mt.id = sub."messageThreadId"
         AND mt."subject" IS NULL`,
      undefined,
      undefined,
      { shouldBypassPermissionChecks: true },
    );

    this.logger.log(
      `Backfilled subject for ${result?.[1] ?? 0} message threads in workspace ${workspaceId}`,
    );
  }
}
