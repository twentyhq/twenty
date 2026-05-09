import { Command } from 'nest-commander';
import { isDefined } from 'twenty-shared/utils';

import { ActiveOrSuspendedWorkspaceCommandRunner } from 'src/database/commands/command-runners/active-or-suspended-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { WidgetConfigurationType } from 'src/engine/metadata-modules/page-layout-widget/enums/widget-configuration-type.type';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';

@RegisteredWorkspaceCommand('2.3.0', 1798000000000)
@Command({
  name: 'upgrade:2-3:delete-gauge-widgets',
  description:
    'Delete all GAUGE_CHART page layout widgets — gauge support has been removed',
})
export class DeleteGaugeWidgetsCommand extends ActiveOrSuspendedWorkspaceCommandRunner {
  constructor(
    protected readonly workspaceIteratorService: WorkspaceIteratorService,
    private readonly applicationService: ApplicationService,
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly workspaceMigrationValidateBuildAndRunService: WorkspaceMigrationValidateBuildAndRunService,
  ) {
    super(workspaceIteratorService);
  }

  override async runOnWorkspace({
    workspaceId,
    options,
  }: RunOnWorkspaceArgs): Promise<void> {
    const isDryRun = options.dryRun ?? false;

    const { flatPageLayoutWidgetMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatPageLayoutWidgetMaps',
      ]);

    // Some legacy widgets have configurations with no recognized configurationType
    // (e.g., not backfilled by the 1.15 widget configuration migration), which
    // makes universalConfiguration undefined after cache recomputation. Skip them
    // since they cannot be gauge widgets, but log them for visibility.
    const widgets = Object.values(
      flatPageLayoutWidgetMaps.byUniversalIdentifier,
    ).filter(isDefined);

    const widgetsWithMissingUniversalConfiguration = widgets.filter(
      (widget) => !isDefined(widget.universalConfiguration),
    );

    if (widgetsWithMissingUniversalConfiguration.length > 0) {
      this.logger.warn(
        `Found ${widgetsWithMissingUniversalConfiguration.length} widget(s) with missing universalConfiguration in workspace ${workspaceId}, skipping them: ${widgetsWithMissingUniversalConfiguration
          .map((widget) => widget.id)
          .join(', ')}`,
      );
    }

    const gaugeWidgets = widgets.filter(
      (widget) =>
        widget.universalConfiguration?.configurationType ===
        WidgetConfigurationType.GAUGE_CHART,
    );

    if (gaugeWidgets.length === 0) {
      this.logger.log(`No gauge widgets in workspace ${workspaceId}`);

      return;
    }

    if (isDryRun) {
      this.logger.log(
        `[DRY RUN] Would delete ${gaugeWidgets.length} gauge widget(s) in workspace ${workspaceId}`,
      );

      return;
    }

    const { twentyStandardFlatApplication } =
      await this.applicationService.findWorkspaceTwentyStandardAndCustomApplicationOrThrow(
        { workspaceId },
      );

    const result =
      await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunWorkspaceMigration(
        {
          allFlatEntityOperationByMetadataName: {
            pageLayoutWidget: {
              flatEntityToCreate: [],
              flatEntityToDelete: gaugeWidgets,
              flatEntityToUpdate: [],
            },
          },
          workspaceId,
          applicationUniversalIdentifier:
            twentyStandardFlatApplication.universalIdentifier,
        },
      );

    if (result.status === 'fail') {
      this.logger.error(
        `Failed to delete gauge widgets in workspace ${workspaceId}:\n${JSON.stringify(result, null, 2)}`,
      );
      throw new Error(
        `Failed to delete gauge widgets for workspace ${workspaceId}`,
      );
    }

    this.logger.log(
      `Deleted ${gaugeWidgets.length} gauge widget(s) for workspace ${workspaceId}`,
    );
  }
}
