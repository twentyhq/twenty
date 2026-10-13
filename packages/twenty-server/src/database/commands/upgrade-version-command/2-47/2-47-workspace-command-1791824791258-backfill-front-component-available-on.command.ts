import { InjectDataSource } from '@nestjs/typeorm';
import { Command } from 'nest-commander';
import { DataSource } from 'typeorm';

import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

const DEFAULT_AVAILABLE_ON = ['OBJECTS', 'DASHBOARDS'];
const NOT_OFFERED_AVAILABLE_ON: string[] = [];

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

@RegisteredWorkspaceCommand('2.47.0', 1791824791258)
@Command({
  name: 'upgrade:2-47:backfill-front-component-available-on',
  description:
    'Keep headless front components and those opened from a settings or command menu item out of the widget pickers',
})
export class BackfillFrontComponentAvailableOnCommand extends ProvisionedWorkspaceCommandRunner {
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
    await this.replaceNotOfferedFrontComponentsAvailableOn(args, {
      from: DEFAULT_AVAILABLE_ON,
      to: NOT_OFFERED_AVAILABLE_ON,
    });
  }

  async down(args: RunOnWorkspaceArgs): Promise<void> {
    await this.replaceNotOfferedFrontComponentsAvailableOn(args, {
      from: NOT_OFFERED_AVAILABLE_ON,
      to: DEFAULT_AVAILABLE_ON,
    });
  }

  private async replaceNotOfferedFrontComponentsAvailableOn(
    { workspaceId, options }: RunOnWorkspaceArgs,
    { from, to }: { from: string[]; to: string[] },
  ): Promise<void> {
    if (options.dryRun) {
      const [{ count }] = await this.dataSource.query<{ count: number }[]>(
        `SELECT COUNT(*)::int AS count
         FROM core."frontComponent" "frontComponent"
         WHERE "frontComponent"."workspaceId" = $1
           AND "frontComponent"."availableOn" = $2::text[]
           AND ${IS_NOT_OFFERED_IN_WIDGET_PICKERS_BY_DEFAULT_PREDICATE}`,
        [workspaceId, from],
      );

      this.logger.log(
        `[DRY RUN] Would set availableOn to {${to.join(',')}} on ${count} front component(s) in workspace ${workspaceId}`,
      );

      return;
    }

    const [, updatedCount]: [unknown[], number] = await this.dataSource.query(
      `UPDATE core."frontComponent" "frontComponent"
       SET "availableOn" = $3::text[]
       WHERE "frontComponent"."workspaceId" = $1
         AND "frontComponent"."availableOn" = $2::text[]
         AND ${IS_NOT_OFFERED_IN_WIDGET_PICKERS_BY_DEFAULT_PREDICATE}`,
      [workspaceId, from, to],
    );

    await this.workspaceCacheService.invalidateAndRecompute(workspaceId, [
      'flatFrontComponentMaps',
    ]);

    this.logger.log(
      `Set availableOn to {${to.join(',')}} on ${updatedCount} front component(s) in workspace ${workspaceId}`,
    );
  }
}
