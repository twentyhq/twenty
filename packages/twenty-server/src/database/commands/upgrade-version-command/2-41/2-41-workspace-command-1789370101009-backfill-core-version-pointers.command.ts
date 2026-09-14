import { Command } from 'nest-commander';
import { isDefined } from 'twenty-shared/utils';
import { type QueryRunner } from 'typeorm';

import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

@RegisteredWorkspaceCommand('2.41.0', 1789370101009)
@Command({
  name: 'upgrade:2-41:backfill-core-version-pointers',
  description:
    'Backfill lastPublishedCoreWorkflowVersionId on core workflows and coreWorkflowVersionId on core command menu items',
})
export class BackfillCoreVersionPointersCommand extends ProvisionedWorkspaceCommandRunner {
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

      if (!options.dryRun) {
        await this.workspaceCacheService.flush(workspaceId, [
          'flatCommandMenuItemMaps',
        ]);
      }
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
    const versionsTable = `"${schema}"."workflowVersion" wv`;
    const predicate = `
      WHERE cw."workspaceId" = $1
        AND cw."lastPublishedCoreWorkflowVersionId" IS NULL
        AND wv.id = cw."lastPublishedVersionId"
        AND wv."coreWorkflowVersionId" IS NOT NULL`;

    const [counts] = await queryRunner.query(
      `SELECT count(*)::int AS total
       FROM core."workflow" cw, ${versionsTable}
       ${predicate}`,
      [workspaceId],
    );

    if (counts.total === 0) {
      return;
    }

    if (dryRun) {
      this.logger.log(
        `[DRY RUN] Would backfill lastPublishedCoreWorkflowVersionId on ${counts.total} core workflow row(s) for workspace ${workspaceId}`,
      );

      return;
    }

    await queryRunner.query(
      `UPDATE core."workflow" cw
       SET "lastPublishedCoreWorkflowVersionId" = wv."coreWorkflowVersionId"
       FROM ${versionsTable}
       ${predicate}`,
      [workspaceId],
    );

    this.logger.log(
      `Backfilled lastPublishedCoreWorkflowVersionId on ${counts.total} core workflow row(s) for workspace ${workspaceId}`,
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
    const versionsTable = `"${schema}"."workflowVersion" wv`;
    const predicate = `
      WHERE cmi."workspaceId" = $1
        AND cmi."coreWorkflowVersionId" IS NULL
        AND wv.id = cmi."workflowVersionId"
        AND wv."coreWorkflowVersionId" IS NOT NULL`;

    const [counts] = await queryRunner.query(
      `SELECT count(*)::int AS total
       FROM core."commandMenuItem" cmi, ${versionsTable}
       ${predicate}`,
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
       FROM ${versionsTable}
       ${predicate}`,
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
