import { Command } from 'nest-commander';
import { isDefined } from 'twenty-shared/utils';

import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';

@RegisteredWorkspaceCommand('2.36.0', 1787748136001)
@Command({
  name: 'upgrade:2-36:backfill-workflow-run-core-ids',
  description:
    'Backfill workflowRun.coreWorkflowId and workflowRun.coreWorkflowVersionId from the workflow and workflowVersion core links',
})
export class BackfillWorkflowRunCoreIdsCommand extends ProvisionedWorkspaceCommandRunner {
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
      this.logger.log(
        `No workspace data source for workspace ${workspaceId}, skipping`,
      );

      return;
    }

    const queryRunner = dataSource.createQueryRunner();

    await queryRunner.connect();

    try {
      const [workspace] = await queryRunner.query(
        `SELECT "databaseSchema" FROM core."workspace" WHERE id = $1`,
        [workspaceId],
      );

      const schema: string | undefined = workspace?.databaseSchema;

      if (!isDefined(schema)) {
        this.logger.log(
          `No database schema for workspace ${workspaceId}, skipping`,
        );

        return;
      }

      const [{ workflowRunTableExists }] = await queryRunner.query(
        `SELECT to_regclass($1) IS NOT NULL AS "workflowRunTableExists"`,
        [`"${schema}"."workflowRun"`],
      );

      if (workflowRunTableExists !== true) {
        this.logger.log(
          `workflowRun table does not exist for workspace ${workspaceId}, skipping`,
        );

        return;
      }

      if (options.dryRun === true) {
        // The new columns may not exist yet in dry-run (the add-fields command
        // also dry-ran), so count candidate rows without referencing them.
        const [{ count }] = await queryRunner.query(
          `SELECT COUNT(*)::int AS count
           FROM "${schema}"."workflowRun" workflowRun
           JOIN "${schema}"."workflowVersion" workflowVersion
             ON workflowVersion.id = workflowRun."workflowVersionId"
           WHERE workflowVersion."coreWorkflowVersionId" IS NOT NULL`,
        );

        this.logger.log(
          `[DRY RUN] Would backfill core ids on up to ${count} workflowRun row(s) for workspace ${workspaceId}`,
        );

        return;
      }

      const [, updatedVersionRowCount] = await queryRunner.query(
        `UPDATE "${schema}"."workflowRun" workflowRun
         SET "coreWorkflowVersionId" = workflowVersion."coreWorkflowVersionId"
         FROM "${schema}"."workflowVersion" workflowVersion
         WHERE workflowVersion.id = workflowRun."workflowVersionId"
           AND workflowRun."coreWorkflowVersionId" IS NULL
           AND workflowVersion."coreWorkflowVersionId" IS NOT NULL`,
      );

      const [, updatedWorkflowRowCount] = await queryRunner.query(
        `UPDATE "${schema}"."workflowRun" workflowRun
         SET "coreWorkflowId" = workflow."coreWorkflowId"
         FROM "${schema}"."workflow" workflow
         WHERE workflow.id = workflowRun."workflowId"
           AND workflowRun."coreWorkflowId" IS NULL
           AND workflow."coreWorkflowId" IS NOT NULL`,
      );

      this.logger.log(
        `Backfilled workflowRun core ids for workspace ${workspaceId} (coreWorkflowVersionId: ${updatedVersionRowCount}, coreWorkflowId: ${updatedWorkflowRowCount})`,
      );
    } finally {
      await queryRunner.release();
    }
  }
}
