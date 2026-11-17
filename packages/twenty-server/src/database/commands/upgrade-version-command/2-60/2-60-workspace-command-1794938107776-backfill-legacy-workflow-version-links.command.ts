import { Command } from 'nest-commander';
import { isDefined } from 'twenty-shared/utils';
import { type QueryRunner } from 'typeorm';

import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

const COMMAND_MENU_ITEM_PREDICATE = `
  WHERE cmi."workspaceId" = $1
    AND cmi."coreWorkflowVersionId" IS NULL
    AND cmi."workflowVersionId" IS NOT NULL`;

const RESOLVABLE_COMMAND_MENU_ITEM_PREDICATE = `${COMMAND_MENU_ITEM_PREDICATE}
    AND cwv."workspaceId" = $1
    AND cwv."workspaceWorkflowVersionId" = cmi."workflowVersionId"`;

const RESOLVABLE_WORKFLOW_PREDICATE = `
  WHERE cw."workspaceId" = $1
    AND cw."lastPublishedCoreWorkflowVersionId" IS NULL
    AND cw."lastPublishedVersionId" IS NOT NULL
    AND cwv."workspaceId" = $1
    AND cwv."coreWorkflowId" = cw.id
    AND cwv."workspaceWorkflowVersionId" = cw."lastPublishedVersionId"`;

@RegisteredWorkspaceCommand('2.60.0', 1794938107776)
@Command({
  name: 'upgrade:2-60:backfill-legacy-workflow-version-links',
  description:
    'Backfill coreWorkflowVersionId on command menu items and lastPublishedCoreWorkflowVersionId on core workflows that only hold a legacy workspace workflow version id, through the core version alias',
})
export class BackfillLegacyWorkflowVersionLinksCommand extends ProvisionedWorkspaceCommandRunner {
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

    const dryRun = options.dryRun ?? false;
    const queryRunner = dataSource.createQueryRunner();

    await queryRunner.connect();

    try {
      const backfilledCommandMenuItemCount =
        await this.backfillCommandMenuItems({
          queryRunner,
          workspaceId,
          dryRun,
        });

      const backfilledWorkflowCount = await this.backfillWorkflows({
        queryRunner,
        workspaceId,
        dryRun,
      });

      await this.warnAboutUnresolvableCommandMenuItems({
        queryRunner,
        workspaceId,
        dryRun,
        backfilledCommandMenuItemCount,
      });

      if (
        !dryRun &&
        (backfilledCommandMenuItemCount > 0 || backfilledWorkflowCount > 0)
      ) {
        await this.workspaceCacheService.flush(workspaceId, [
          'flatCommandMenuItemMaps',
          'flatWorkflowMaps',
        ]);
      }
    } finally {
      await queryRunner.release();
    }
  }

  private async backfillCommandMenuItems({
    queryRunner,
    workspaceId,
    dryRun,
  }: {
    queryRunner: QueryRunner;
    workspaceId: string;
    dryRun: boolean;
  }): Promise<number> {
    const [{ total }] = await queryRunner.query(
      `SELECT count(*)::int AS total
       FROM core."commandMenuItem" cmi, core."workflowVersion" cwv
       ${RESOLVABLE_COMMAND_MENU_ITEM_PREDICATE}`,
      [workspaceId],
    );

    if (total === 0) {
      return 0;
    }

    if (dryRun) {
      this.logger.log(
        `[DRY RUN] Would backfill coreWorkflowVersionId on ${total} command menu item(s) for workspace ${workspaceId}`,
      );

      return total;
    }

    await queryRunner.query(
      `UPDATE core."commandMenuItem" cmi
       SET "coreWorkflowVersionId" = cwv.id
       FROM core."workflowVersion" cwv
       ${RESOLVABLE_COMMAND_MENU_ITEM_PREDICATE}`,
      [workspaceId],
    );

    this.logger.log(
      `Backfilled coreWorkflowVersionId on ${total} command menu item(s) for workspace ${workspaceId}`,
    );

    return total;
  }

  private async backfillWorkflows({
    queryRunner,
    workspaceId,
    dryRun,
  }: {
    queryRunner: QueryRunner;
    workspaceId: string;
    dryRun: boolean;
  }): Promise<number> {
    const [{ total }] = await queryRunner.query(
      `SELECT count(*)::int AS total
       FROM core."workflow" cw, core."workflowVersion" cwv
       ${RESOLVABLE_WORKFLOW_PREDICATE}`,
      [workspaceId],
    );

    if (total === 0) {
      return 0;
    }

    if (dryRun) {
      this.logger.log(
        `[DRY RUN] Would backfill lastPublishedCoreWorkflowVersionId on ${total} core workflow(s) for workspace ${workspaceId}`,
      );

      return total;
    }

    await queryRunner.query(
      `UPDATE core."workflow" cw
       SET "lastPublishedCoreWorkflowVersionId" = cwv.id
       FROM core."workflowVersion" cwv
       ${RESOLVABLE_WORKFLOW_PREDICATE}`,
      [workspaceId],
    );

    this.logger.log(
      `Backfilled lastPublishedCoreWorkflowVersionId on ${total} core workflow(s) for workspace ${workspaceId}`,
    );

    return total;
  }

  private async warnAboutUnresolvableCommandMenuItems({
    queryRunner,
    workspaceId,
    dryRun,
    backfilledCommandMenuItemCount,
  }: {
    queryRunner: QueryRunner;
    workspaceId: string;
    dryRun: boolean;
    backfilledCommandMenuItemCount: number;
  }): Promise<void> {
    const [{ total }] = await queryRunner.query(
      `SELECT count(*)::int AS total
       FROM core."commandMenuItem" cmi
       ${COMMAND_MENU_ITEM_PREDICATE}`,
      [workspaceId],
    );

    const unresolvableCount = dryRun
      ? total - backfilledCommandMenuItemCount
      : total;

    if (unresolvableCount === 0) {
      return;
    }

    this.logger.warn(
      `${unresolvableCount} command menu item(s) in workspace ${workspaceId} keep only a legacy workflowVersionId that resolves to no core workflow version`,
    );
  }
}
