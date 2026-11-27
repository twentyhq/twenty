import { InjectDataSource } from '@nestjs/typeorm';
import { Command } from 'nest-commander';
import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { isDefined } from 'twenty-shared/utils';
import { DataSource } from 'typeorm';

import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { computeObjectTargetTable } from 'src/engine/utils/compute-object-target-table.util';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';
import { escapeIdentifier } from 'src/engine/workspace-manager/workspace-migration/utils/remove-sql-injection.util';

// Frozen at 2.61: the status is removed from the enum in a later release, once this has run everywhere
const NOT_STARTED_WORKFLOW_RUN_STATUS = 'NOT_STARTED';

@RegisteredWorkspaceCommand('2.61.0', 1795088158840)
@Command({
  name: 'upgrade:2-61:convert-not-started-workflow-runs',
  description:
    'Move the workflow runs still NOT_STARTED to ENQUEUED, where the stale-run sweep gives them a job',
})
export class ConvertNotStartedWorkflowRunsCommand extends ProvisionedWorkspaceCommandRunner {
  constructor(
    protected readonly workspaceIteratorService: WorkspaceIteratorService,
    private readonly workspaceCacheService: WorkspaceCacheService,
    @InjectDataSource() private readonly dataSource: DataSource,
  ) {
    super(workspaceIteratorService);
  }

  override async runOnWorkspace({
    workspaceId,
    options,
  }: RunOnWorkspaceArgs): Promise<void> {
    const { flatObjectMetadataMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatObjectMetadataMaps',
      ]);

    const workflowRunObject =
      flatObjectMetadataMaps.byUniversalIdentifier[
        STANDARD_OBJECTS.workflowRun.universalIdentifier
      ];

    if (!isDefined(workflowRunObject)) {
      this.logger.log(
        `No workflowRun table for workspace ${workspaceId}, skipping`,
      );

      return;
    }

    const workflowRunTable = `${escapeIdentifier(getWorkspaceSchemaName(workspaceId))}.${escapeIdentifier(computeObjectTargetTable(workflowRunObject))}`;

    if (options.dryRun ?? false) {
      const [{ total }]: { total: number }[] = await this.dataSource.query(
        `SELECT count(*)::int AS total FROM ${workflowRunTable} WHERE status::text = $1`,
        [NOT_STARTED_WORKFLOW_RUN_STATUS],
      );

      if (total > 0) {
        this.logger.log(
          `[DRY RUN] Would move ${total} NOT_STARTED workflow run(s) to ENQUEUED for workspace ${workspaceId}`,
        );
      }

      return;
    }

    // A null enqueuedAt marks the run as stale, so the sweep gives it a job
    const [, convertedRunCount]: [unknown[], number] =
      await this.dataSource.query(
        `UPDATE ${workflowRunTable} SET status = 'ENQUEUED', "enqueuedAt" = NULL WHERE status::text = $1`,
        [NOT_STARTED_WORKFLOW_RUN_STATUS],
      );

    if (convertedRunCount > 0) {
      this.logger.log(
        `Moved ${convertedRunCount} NOT_STARTED workflow run(s) to ENQUEUED for workspace ${workspaceId}`,
      );
    }
  }
}
