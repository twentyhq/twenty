import { Command } from 'nest-commander';
import { isDefined } from 'twenty-shared/utils';

import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';
import { escapeIdentifier } from 'src/engine/workspace-manager/workspace-migration/utils/remove-sql-injection.util';

const ORPHANED_WORKFLOW_RUN_CONDITION = `
  run."deletedAt" IS NULL
  AND (
    (
      run."coreWorkflowId" IS NOT NULL
      AND NOT EXISTS (
        SELECT 1 FROM core."workflow" workflow
        WHERE workflow.id = run."coreWorkflowId"
      )
    )
    OR (
      run."coreWorkflowVersionId" IS NOT NULL
      AND NOT EXISTS (
        SELECT 1 FROM core."workflowVersion" version
        WHERE version.id = run."coreWorkflowVersionId"
      )
    )
  )`;

@RegisteredWorkspaceCommand('2.46.0', 1791369613345)
@Command({
  name: 'upgrade:2-46:delete-orphaned-workflow-runs',
  description:
    'Delete the live workflow runs whose core workflow or version was deleted before deletions removed their runs',
})
export class DeleteOrphanedWorkflowRunsCommand extends ProvisionedWorkspaceCommandRunner {
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
      return;
    }

    const workflowRunTable = `${escapeIdentifier(getWorkspaceSchemaName(workspaceId))}."workflowRun"`;

    if (options.dryRun) {
      const [{ count }]: [{ count: number }] = await dataSource.query(
        `SELECT COUNT(*)::int AS count FROM ${workflowRunTable} run WHERE ${ORPHANED_WORKFLOW_RUN_CONDITION}`,
      );

      this.logger.log(
        `[DRY RUN] Would delete ${count} orphaned workflow run(s) for workspace ${workspaceId}`,
      );

      return;
    }

    const [deletedRuns]: [{ id: string }[], number] = await dataSource.query(
      `DELETE FROM ${workflowRunTable} run WHERE ${ORPHANED_WORKFLOW_RUN_CONDITION} RETURNING run.id`,
    );

    this.logger.log(
      `Deleted ${deletedRuns.length} orphaned workflow run(s) for workspace ${workspaceId}`,
    );
  }
}
