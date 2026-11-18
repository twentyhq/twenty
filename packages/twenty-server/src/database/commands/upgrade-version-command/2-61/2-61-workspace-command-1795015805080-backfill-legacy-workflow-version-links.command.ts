import { Command } from 'nest-commander';
import { isDefined } from 'twenty-shared/utils';

import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

type WorkspaceDataSource = NonNullable<RunOnWorkspaceArgs['dataSource']>;

const COMMAND_MENU_ITEM_PREDICATE = `
  WHERE cmi."workspaceId" = $1
    AND cmi."coreWorkflowVersionId" IS NULL
    AND cmi."workflowVersionId" IS NOT NULL
    AND cwv."workspaceId" = $1
    AND cwv."workspaceWorkflowVersionId" = cmi."workflowVersionId"`;

const WORKFLOW_PREDICATE = `
  WHERE cw."workspaceId" = $1
    AND cw."lastPublishedCoreWorkflowVersionId" IS NULL
    AND cw."lastPublishedVersionId" IS NOT NULL
    AND cwv."workspaceId" = $1
    AND cwv."coreWorkflowId" = cw.id
    AND cwv."workspaceWorkflowVersionId" = cw."lastPublishedVersionId"`;

@RegisteredWorkspaceCommand('2.61.0', 1795015805080)
@Command({
  name: 'upgrade:2-61:backfill-legacy-workflow-version-links',
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

    const commandMenuItemCount = await this.backfill({
      dataSource,
      workspaceId,
      dryRun,
      label: 'coreWorkflowVersionId on command menu item(s)',
      countQuery: `SELECT count(*)::int AS total
        FROM core."commandMenuItem" cmi, core."workflowVersion" cwv
        ${COMMAND_MENU_ITEM_PREDICATE}`,
      updateQuery: `UPDATE core."commandMenuItem" cmi
        SET "coreWorkflowVersionId" = cwv.id
        FROM core."workflowVersion" cwv
        ${COMMAND_MENU_ITEM_PREDICATE}`,
    });

    const workflowCount = await this.backfill({
      dataSource,
      workspaceId,
      dryRun,
      label: 'lastPublishedCoreWorkflowVersionId on core workflow(s)',
      countQuery: `SELECT count(*)::int AS total
        FROM core."workflow" cw, core."workflowVersion" cwv
        ${WORKFLOW_PREDICATE}`,
      updateQuery: `UPDATE core."workflow" cw
        SET "lastPublishedCoreWorkflowVersionId" = cwv.id
        FROM core."workflowVersion" cwv
        ${WORKFLOW_PREDICATE}`,
    });

    if (!dryRun && (commandMenuItemCount > 0 || workflowCount > 0)) {
      await this.workspaceCacheService.flush(workspaceId, [
        'flatCommandMenuItemMaps',
        'flatWorkflowMaps',
      ]);
    }
  }

  private async backfill({
    dataSource,
    workspaceId,
    dryRun,
    label,
    countQuery,
    updateQuery,
  }: {
    dataSource: WorkspaceDataSource;
    workspaceId: string;
    dryRun: boolean;
    label: string;
    countQuery: string;
    updateQuery: string;
  }): Promise<number> {
    if (dryRun) {
      const [{ total }]: { total: number }[] = await dataSource.query(
        countQuery,
        [workspaceId],
      );

      if (total > 0) {
        this.logger.log(
          `[DRY RUN] Would backfill ${label}: ${total} for workspace ${workspaceId}`,
        );
      }

      return total;
    }

    const [, updatedCount]: [unknown[], number] = await dataSource.query(
      updateQuery,
      [workspaceId],
    );

    if (updatedCount > 0) {
      this.logger.log(
        `Backfilled ${label}: ${updatedCount} for workspace ${workspaceId}`,
      );
    }

    return updatedCount;
  }
}
