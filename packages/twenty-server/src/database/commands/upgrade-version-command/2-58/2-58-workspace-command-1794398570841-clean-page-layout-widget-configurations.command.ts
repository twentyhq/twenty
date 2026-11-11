import { Command } from 'nest-commander';
import { isDefined } from 'twenty-shared/utils';

import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { rewriteJsonbRowsWithCompareAndSet } from 'src/database/commands/upgrade-version-command/2-56/utils/rewrite-jsonb-rows-with-compare-and-set.util';
import { cleanPageLayoutWidgetConfiguration } from 'src/database/commands/upgrade-version-command/2-58/utils/clean-page-layout-widget-configuration.util';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

@RegisteredWorkspaceCommand('2.58.0', 1794398570841)
@Command({
  name: 'upgrade:2-58:clean-page-layout-widget-configurations',
  description:
    'Drop chart settings left from a previous chart type, cleared settings stored as null and __typename from page layout widget configurations, which writes no longer store',
})
export class CleanPageLayoutWidgetConfigurationsCommand extends ProvisionedWorkspaceCommandRunner {
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
        `No data source for workspace ${workspaceId}, skipping page layout widget configuration cleanup`,
      );

      return;
    }

    const isDryRun = options.dryRun ?? false;

    const cleanedWidgetCount = await rewriteJsonbRowsWithCompareAndSet({
      dataSource,
      isDryRun,
      tableName: 'core."pageLayoutWidget"',
      columnName: 'configuration',
      whereClause: `"workspaceId" = $1 AND jsonb_typeof(configuration) = 'object'`,
      whereParameters: [workspaceId],
      mapRow: ({ value }) => cleanPageLayoutWidgetConfiguration(value),
    });

    if (cleanedWidgetCount === 0) {
      return;
    }

    if (!isDryRun) {
      await this.workspaceCacheService.invalidateAndRecompute(workspaceId, [
        'flatPageLayoutWidgetMaps',
      ]);
    }

    this.logger.log(
      `${isDryRun ? '[DRY RUN] ' : ''}Cleaned ${cleanedWidgetCount} page layout widget configuration(s) for workspace ${workspaceId}`,
    );
  }
}
