import { InjectDataSource } from '@nestjs/typeorm';
import { Command } from 'nest-commander';
import { DataSource } from 'typeorm';

import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

// Inlined rather than imported from twenty-shared so this command keeps writing
// what it wrote the day it ran, whatever those constants become.
const DEFAULT_AVAILABLE_ON = ['OBJECTS', 'DASHBOARDS'];
const SETTINGS_AVAILABLE_ON = ['SETTINGS'];

// Mirrors the default applied on manifest sync, so components installed before
// the column existed leave the widget pickers without waiting for their next sync.
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

@RegisteredWorkspaceCommand('2.47.0', 1791824791258)
@Command({
  name: 'upgrade:2-47:backfill-front-component-available-on',
  description:
    'Make front components rendered as settings pages available on settings only',
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
    await this.replaceSettingsPageFrontComponentsAvailableOn(args, {
      from: DEFAULT_AVAILABLE_ON,
      to: SETTINGS_AVAILABLE_ON,
    });
  }

  async down(args: RunOnWorkspaceArgs): Promise<void> {
    await this.replaceSettingsPageFrontComponentsAvailableOn(args, {
      from: SETTINGS_AVAILABLE_ON,
      to: DEFAULT_AVAILABLE_ON,
    });
  }

  private async replaceSettingsPageFrontComponentsAvailableOn(
    { workspaceId, options }: RunOnWorkspaceArgs,
    { from, to }: { from: string[]; to: string[] },
  ): Promise<void> {
    if (options.dryRun ?? false) {
      const [{ count }] = await this.dataSource.query<{ count: number }[]>(
        `SELECT COUNT(*)::int AS count
         FROM core."frontComponent" "frontComponent"
         WHERE "frontComponent"."workspaceId" = $1
           AND "frontComponent"."availableOn" = $2::text[]
           AND ${IS_SETTINGS_PAGE_FRONT_COMPONENT_PREDICATE}`,
        [workspaceId, from],
      );

      this.logger.log(
        `[DRY RUN] Would set availableOn to ${to.join(', ')} on ${count} front component(s) in workspace ${workspaceId}`,
      );

      return;
    }

    const [, updatedCount]: [unknown[], number] = await this.dataSource.query(
      `UPDATE core."frontComponent" "frontComponent"
       SET "availableOn" = $3::text[]
       WHERE "frontComponent"."workspaceId" = $1
         AND "frontComponent"."availableOn" = $2::text[]
         AND ${IS_SETTINGS_PAGE_FRONT_COMPONENT_PREDICATE}`,
      [workspaceId, from, to],
    );

    // Recomputed even when nothing changed: front components cached before the
    // column existed lack the field, which the GraphQL type requires
    await this.workspaceCacheService.invalidateAndRecompute(workspaceId, [
      'flatFrontComponentMaps',
    ]);

    this.logger.log(
      `Set availableOn to ${to.join(', ')} on ${updatedCount} front component(s) in workspace ${workspaceId}`,
    );
  }
}
