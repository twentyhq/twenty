import { Command } from 'nest-commander';
import { isDefined } from 'twenty-shared/utils';
import { type QueryRunner } from 'typeorm';

import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';

@RegisteredWorkspaceCommand('2.40.0', 1789056077009)
@Command({
  name: 'upgrade:2-40:backfill-core-version-pointers',
  description:
    'Backfill lastPublishedCoreVersionId on core workflows and coreWorkflowVersionId on core command menu items',
})
export class BackfillCoreVersionPointersCommand extends ProvisionedWorkspaceCommandRunner {
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
        return;
      }

      await this.backfillWorkflows({
        queryRunner,
        schema,
        workspaceId,
        dryRun: options.dryRun ?? false,
      });

      await this.backfillCommandMenuItems({
        queryRunner,
        schema,
        workspaceId,
        dryRun: options.dryRun ?? false,
      });
    } finally {
      await queryRunner.release();
    }
  }

  private async backfillWorkflows({
    queryRunner,
    schema,
    workspaceId,
    dryRun,
  }: {
    queryRunner: QueryRunner;
    schema: string;
    workspaceId: string;
    dryRun: boolean;
  }): Promise<void> {
    const targetRows = `
      FROM "${schema}"."workflowVersion" wv
      WHERE cw."workspaceId" = $1
        AND cw."lastPublishedCoreVersionId" IS NULL
        AND wv.id = cw."lastPublishedVersionId"
        AND wv."coreWorkflowVersionId" IS NOT NULL`;

    const [counts] = await queryRunner.query(
      `SELECT count(*)::int AS total FROM core."workflow" cw, ${targetRows}`,
      [workspaceId],
    );

    if (counts.total === 0) {
      return;
    }

    if (dryRun) {
      this.logger.log(
        `[DRY RUN] Would backfill lastPublishedCoreVersionId on ${counts.total} core workflow row(s) for workspace ${workspaceId}`,
      );

      return;
    }

    await queryRunner.query(
      `UPDATE core."workflow" cw
       SET "lastPublishedCoreVersionId" = wv."coreWorkflowVersionId"
       ${targetRows}`,
      [workspaceId],
    );

    this.logger.log(
      `Backfilled lastPublishedCoreVersionId on ${counts.total} core workflow row(s) for workspace ${workspaceId}`,
    );
  }

  private async backfillCommandMenuItems({
    queryRunner,
    schema,
    workspaceId,
    dryRun,
  }: {
    queryRunner: QueryRunner;
    schema: string;
    workspaceId: string;
    dryRun: boolean;
  }): Promise<void> {
    const targetRows = `
      FROM "${schema}"."workflowVersion" wv
      WHERE cmi."workspaceId" = $1
        AND cmi."coreWorkflowVersionId" IS NULL
        AND wv.id = cmi."workflowVersionId"
        AND wv."coreWorkflowVersionId" IS NOT NULL`;

    const [counts] = await queryRunner.query(
      `SELECT count(*)::int AS total FROM core."commandMenuItem" cmi, ${targetRows}`,
      [workspaceId],
    );

    if (counts.total === 0) {
      return;
    }

    if (dryRun) {
      this.logger.log(
        `[DRY RUN] Would backfill coreWorkflowVersionId on ${counts.total} core command menu item row(s) for workspace ${workspaceId}`,
      );

      return;
    }

    await queryRunner.query(
      `UPDATE core."commandMenuItem" cmi
       SET "coreWorkflowVersionId" = wv."coreWorkflowVersionId"
       ${targetRows}`,
      [workspaceId],
    );

    this.logger.log(
      `Backfilled coreWorkflowVersionId on ${counts.total} core command menu item row(s) for workspace ${workspaceId}`,
    );
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
