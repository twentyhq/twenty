import { Command } from 'nest-commander';
import { isDefined } from 'twenty-shared/utils';
import { type QueryRunner } from 'typeorm';

import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';

@RegisteredWorkspaceCommand('2.41.0', 1789642800001)
@Command({
  name: 'upgrade:2-41:backfill-workspace-workflow-version-id',
  description:
    'Backfill workspaceWorkflowVersionId on core workflow versions from the workspace mirror',
})
export class BackfillWorkspaceWorkflowVersionIdCommand extends ProvisionedWorkspaceCommandRunner {
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
        `No data source for workspace ${workspaceId}, skipping backfill`,
      );

      return;
    }

    const schema = getWorkspaceSchemaName(workspaceId);
    const queryRunner = dataSource.createQueryRunner();

    await queryRunner.connect();

    try {
      if (!(await this.hasCoreWorkflowVersionIdColumn(queryRunner, schema))) {
        this.logger.warn(
          `workflowVersion.coreWorkflowVersionId missing for workspace ${workspaceId}, skipping backfill`,
        );

        return;
      }

      const predicate = `
        FROM "${schema}"."workflowVersion" wv
        WHERE wv."coreWorkflowVersionId" = cv."id"
          AND wv."deletedAt" IS NULL
          AND cv."workspaceId" = $1
          AND cv."workspaceWorkflowVersionId" IS DISTINCT FROM wv."id"`;

      if (options.dryRun ?? false) {
        const [{ count }] = await queryRunner.query(
          `SELECT count(*)::int AS count FROM core."workflowVersion" cv WHERE EXISTS (SELECT 1 ${predicate})`,
          [workspaceId],
        );

        this.logger.log(
          `[DRY RUN] ${count} core workflow version(s) would get their workspaceWorkflowVersionId in workspace ${workspaceId}`,
        );

        return;
      }

      const result = await queryRunner.query(
        `UPDATE core."workflowVersion" cv
         SET "workspaceWorkflowVersionId" = wv."id"
         ${predicate}`,
        [workspaceId],
      );

      this.logger.log(
        `Backfilled workspaceWorkflowVersionId on ${result[1] ?? 0} core workflow version(s) in workspace ${workspaceId}`,
      );
    } finally {
      await queryRunner.release();
    }
  }

  private async hasCoreWorkflowVersionIdColumn(
    queryRunner: QueryRunner,
    schema: string,
  ): Promise<boolean> {
    const rows = await queryRunner.query(
      `SELECT 1
       FROM information_schema.columns
       WHERE table_schema = $1
         AND table_name = 'workflowVersion'
         AND column_name = 'coreWorkflowVersionId'
       LIMIT 1`,
      [schema],
    );

    return rows.length > 0;
  }
}
