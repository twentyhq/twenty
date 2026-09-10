import { Command } from 'nest-commander';
import { isDefined } from 'twenty-shared/utils';
import { type QueryRunner } from 'typeorm';

import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';

@RegisteredWorkspaceCommand('2.40.0', 1789036819010)
@Command({
  name: 'upgrade:2-40:backfill-workspace-workflow-id-on-workflows',
  description:
    'Backfill workspaceWorkflowId on core workflow rows from the workspace workflow mapping',
})
export class BackfillWorkspaceWorkflowIdOnWorkflowsCommand extends ProvisionedWorkspaceCommandRunner {
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

    const lowestWorkspaceWorkflowIdSubquery = `
      SELECT w.id
      FROM "${schema}"."workflow" w
      WHERE w."coreWorkflowId" = cw.id
        AND w."deletedAt" IS NULL
      ORDER BY w.id
      LIMIT 1`;

    const queryRunner = dataSource.createQueryRunner();

    await queryRunner.connect();

    try {
      if (!(await this.hasCoreWorkflowIdColumn(queryRunner, schema))) {
        return;
      }

      const [counts] = await queryRunner.query(
        `SELECT count(*)::int AS total
         FROM core."workflow" cw
         WHERE cw."workspaceId" = $1
           AND cw."workspaceWorkflowId" IS NULL
           AND EXISTS (${lowestWorkspaceWorkflowIdSubquery})`,
        [workspaceId],
      );

      if (counts.total === 0) {
        return;
      }

      if (options.dryRun) {
        this.logger.log(
          `[DRY RUN] Would backfill workspaceWorkflowId on ${counts.total} core workflow row(s) for workspace ${workspaceId}`,
        );

        return;
      }

      await queryRunner.query(
        `UPDATE core."workflow" cw
         SET "workspaceWorkflowId" = (${lowestWorkspaceWorkflowIdSubquery})
         WHERE cw."workspaceId" = $1
           AND cw."workspaceWorkflowId" IS NULL
           AND EXISTS (${lowestWorkspaceWorkflowIdSubquery})`,
        [workspaceId],
      );

      this.logger.log(
        `Backfilled workspaceWorkflowId on ${counts.total} core workflow row(s) for workspace ${workspaceId}`,
      );
    } finally {
      await queryRunner.release();
    }
  }

  private async hasCoreWorkflowIdColumn(
    queryRunner: QueryRunner,
    schema: string,
  ): Promise<boolean> {
    const rows = await queryRunner.query(
      `SELECT 1
       FROM information_schema.columns
       WHERE table_schema = $1
         AND table_name = 'workflow'
         AND column_name = 'coreWorkflowId'
       LIMIT 1`,
      [schema],
    );

    return rows.length > 0;
  }
}
