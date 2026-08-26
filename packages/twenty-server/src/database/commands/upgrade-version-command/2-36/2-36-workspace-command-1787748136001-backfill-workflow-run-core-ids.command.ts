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

      const [{ to_regclass: workflowRunTable }] = await queryRunner.query(
        `SELECT to_regclass($1)`,
        [`"${schema}"."workflowRun"`],
      );

      if (!isDefined(workflowRunTable)) {
        this.logger.log(
          `workflowRun table does not exist for workspace ${workspaceId}, skipping`,
        );

        return;
      }

      if (options.dryRun === true) {
        const [{ count }] = await queryRunner.query(
          `SELECT COUNT(*)::int AS count FROM "${schema}"."workflowRun"
           WHERE "coreWorkflowId" IS NULL OR "coreWorkflowVersionId" IS NULL`,
        );

        this.logger.log(
          `[DRY RUN] Would backfill core ids on up to ${count} workflowRun row(s) for workspace ${workspaceId}`,
        );

        return;
      }

      const updatedVersionRows = await queryRunner.query(
        `UPDATE "${schema}"."workflowRun" workflowRun
         SET "coreWorkflowVersionId" = workflowVersion."coreWorkflowVersionId"
         FROM "${schema}"."workflowVersion" workflowVersion
         WHERE workflowVersion.id = workflowRun."workflowVersionId"
           AND workflowRun."coreWorkflowVersionId" IS NULL
           AND workflowVersion."coreWorkflowVersionId" IS NOT NULL
         RETURNING workflowRun.id`,
      );

      const updatedWorkflowRows = await queryRunner.query(
        `UPDATE "${schema}"."workflowRun" workflowRun
         SET "coreWorkflowId" = workflow."coreWorkflowId"
         FROM "${schema}"."workflow" workflow
         WHERE workflow.id = workflowRun."workflowId"
           AND workflowRun."coreWorkflowId" IS NULL
           AND workflow."coreWorkflowId" IS NOT NULL
         RETURNING workflowRun.id`,
      );

      this.logger.log(
        `Backfilled workflowRun core ids for workspace ${workspaceId} (coreWorkflowVersionId: ${updatedVersionRows.length}, coreWorkflowId: ${updatedWorkflowRows.length})`,
      );
    } finally {
      await queryRunner.release();
    }
  }
}
