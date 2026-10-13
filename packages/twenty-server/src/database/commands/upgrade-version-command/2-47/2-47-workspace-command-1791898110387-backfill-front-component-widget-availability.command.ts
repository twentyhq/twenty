import { InjectDataSource } from '@nestjs/typeorm';
import { Command } from 'nest-commander';
import { DataSource } from 'typeorm';

import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

const DEFAULT_WIDGET_AVAILABILITY = [
  { pageLayoutType: 'RECORD_PAGE' },
  { pageLayoutType: 'DASHBOARD' },
];
const NOT_OFFERED_WIDGET_AVAILABILITY: object[] = [];

const IS_NOT_OFFERED_IN_WIDGET_PICKERS_BY_DEFAULT_PREDICATE = `(
  "frontComponent"."isHeadless" = true
  OR "frontComponent".id IN (
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
  OR "frontComponent".id IN (
    SELECT "commandMenuItem"."frontComponentId"
    FROM core."commandMenuItem" "commandMenuItem"
    WHERE "commandMenuItem"."workspaceId" = $1
      AND "commandMenuItem"."applicationId" = "frontComponent"."applicationId"
      AND "commandMenuItem"."frontComponentId" IS NOT NULL
  )
)`;

@RegisteredWorkspaceCommand('2.47.0', 1791898110387)
@Command({
  name: 'upgrade:2-47:backfill-front-component-widget-availability',
  description:
    'Keep headless front components and those opened from a settings or command menu item out of the widget pickers',
})
export class BackfillFrontComponentWidgetAvailabilityCommand extends ProvisionedWorkspaceCommandRunner {
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
    await this.replaceNotOfferedFrontComponentsWidgetAvailability(args, {
      from: DEFAULT_WIDGET_AVAILABILITY,
      to: NOT_OFFERED_WIDGET_AVAILABILITY,
    });
  }

  async down(args: RunOnWorkspaceArgs): Promise<void> {
    await this.replaceNotOfferedFrontComponentsWidgetAvailability(args, {
      from: NOT_OFFERED_WIDGET_AVAILABILITY,
      to: DEFAULT_WIDGET_AVAILABILITY,
    });
  }

  private async replaceNotOfferedFrontComponentsWidgetAvailability(
    { workspaceId, options }: RunOnWorkspaceArgs,
    { from, to }: { from: object[]; to: object[] },
  ): Promise<void> {
    if (options.dryRun) {
      const [{ count }] = await this.dataSource.query<{ count: number }[]>(
        `SELECT COUNT(*)::int AS count
         FROM core."frontComponent" "frontComponent"
         WHERE "frontComponent"."workspaceId" = $1
           AND "frontComponent"."widgetAvailability" = $2::jsonb
           AND ${IS_NOT_OFFERED_IN_WIDGET_PICKERS_BY_DEFAULT_PREDICATE}`,
        [workspaceId, JSON.stringify(from)],
      );

      this.logger.log(
        `[DRY RUN] Would set widgetAvailability to ${JSON.stringify(to)} on ${count} front component(s) in workspace ${workspaceId}`,
      );

      return;
    }

    const [, updatedCount]: [unknown[], number] = await this.dataSource.query(
      `UPDATE core."frontComponent" "frontComponent"
       SET "widgetAvailability" = $3::jsonb
       WHERE "frontComponent"."workspaceId" = $1
         AND "frontComponent"."widgetAvailability" = $2::jsonb
         AND ${IS_NOT_OFFERED_IN_WIDGET_PICKERS_BY_DEFAULT_PREDICATE}`,
      [workspaceId, JSON.stringify(from), JSON.stringify(to)],
    );

    await this.workspaceCacheService.invalidateAndRecompute(workspaceId, [
      'flatFrontComponentMaps',
    ]);

    this.logger.log(
      `Set widgetAvailability to ${JSON.stringify(to)} on ${updatedCount} front component(s) in workspace ${workspaceId}`,
    );
  }
}
