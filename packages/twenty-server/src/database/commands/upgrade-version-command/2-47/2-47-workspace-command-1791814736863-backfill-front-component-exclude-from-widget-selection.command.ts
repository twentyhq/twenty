import { InjectDataSource } from '@nestjs/typeorm';
import { Command } from 'nest-commander';
import { DataSource } from 'typeorm';

import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

// Mirrors the default applied on manifest sync, so components installed before
// the column existed leave the widget picker without waiting for their next sync.
// Sync only sees the owning application's manifest, so a reference from another
// application must not count here, or that application's next sync would undo it.
const IS_SETTINGS_PAGE_FRONT_COMPONENT_PREDICATE = `(
  "frontComponent".id IN (
    SELECT application."settingsCustomTabFrontComponentId"
    FROM core."application" application
    WHERE application."workspaceId" = $1
      AND application.id = "frontComponent"."applicationId"
      AND application."settingsCustomTabFrontComponentId" IS NOT NULL
  )
  OR "frontComponent".id IN (
    SELECT "settingsMenuItem"."frontComponentId"
    FROM core."settingsMenuItem" "settingsMenuItem"
    WHERE "settingsMenuItem"."workspaceId" = $1
      AND "settingsMenuItem"."applicationId" = "frontComponent"."applicationId"
  )
)`;

@RegisteredWorkspaceCommand('2.47.0', 1791814736863)
@Command({
  name: 'upgrade:2-47:backfill-front-component-exclude-from-widget-selection',
  description:
    'Exclude front components rendered as settings pages from the widget picker',
})
export class BackfillFrontComponentExcludeFromWidgetSelectionCommand extends ProvisionedWorkspaceCommandRunner {
  constructor(
    protected readonly workspaceIteratorService: WorkspaceIteratorService,
    private readonly workspaceCacheService: WorkspaceCacheService,
    @InjectDataSource() private readonly dataSource: DataSource,
  ) {
    super(workspaceIteratorService);
  }

  override async runOnWorkspace(args: RunOnWorkspaceArgs): Promise<void> {
    await this.up(args);
  }

  async up(args: RunOnWorkspaceArgs): Promise<void> {
    await this.setSettingsPageFrontComponentsExcludeFromWidgetSelection(
      args,
      true,
    );
  }

  async down(args: RunOnWorkspaceArgs): Promise<void> {
    await this.setSettingsPageFrontComponentsExcludeFromWidgetSelection(
      args,
      false,
    );
  }

  private async setSettingsPageFrontComponentsExcludeFromWidgetSelection(
    { workspaceId, options }: RunOnWorkspaceArgs,
    excludeFromWidgetSelection: boolean,
  ): Promise<void> {
    if (options.dryRun ?? false) {
      const [{ count }] = await this.dataSource.query<{ count: number }[]>(
        `SELECT COUNT(*)::int AS count
         FROM core."frontComponent" "frontComponent"
         WHERE "frontComponent"."workspaceId" = $1
           AND "frontComponent"."excludeFromWidgetSelection" = NOT $2
           AND ${IS_SETTINGS_PAGE_FRONT_COMPONENT_PREDICATE}`,
        [workspaceId, excludeFromWidgetSelection],
      );

      this.logger.log(
        `[DRY RUN] Would set excludeFromWidgetSelection to ${excludeFromWidgetSelection} on ${count} front component(s) in workspace ${workspaceId}`,
      );

      return;
    }

    const [, updatedCount]: [unknown[], number] = await this.dataSource.query(
      `UPDATE core."frontComponent" "frontComponent"
       SET "excludeFromWidgetSelection" = $2
       WHERE "frontComponent"."workspaceId" = $1
         AND "frontComponent"."excludeFromWidgetSelection" = NOT $2
         AND ${IS_SETTINGS_PAGE_FRONT_COMPONENT_PREDICATE}`,
      [workspaceId, excludeFromWidgetSelection],
    );

    if (updatedCount > 0) {
      await this.workspaceCacheService.invalidateAndRecompute(workspaceId, [
        'flatFrontComponentMaps',
      ]);
    }

    this.logger.log(
      `Set excludeFromWidgetSelection to ${excludeFromWidgetSelection} on ${updatedCount} front component(s) in workspace ${workspaceId}`,
    );
  }
}
