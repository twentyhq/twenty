import { Command } from 'nest-commander';
import { isDefined } from 'twenty-shared/utils';

import { ActiveOrSuspendedWorkspaceCommandRunner } from 'src/database/commands/command-runners/active-or-suspended-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { type FlatPageLayoutWidget } from 'src/engine/metadata-modules/flat-page-layout-widget/types/flat-page-layout-widget.type';
import { WidgetConfigurationType } from 'src/engine/metadata-modules/page-layout-widget/enums/widget-configuration-type.type';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';

@RegisteredWorkspaceCommand('2.9.0', 1799000030000)
@Command({
  name: 'upgrade:2-9:backfill-fields-widget-new-field-default-visibility',
  description:
    'Backfill newFieldDefaultVisibility to true on standard FIELDS page layout widgets where it is null',
})
export class BackfillFieldsWidgetNewFieldDefaultVisibilityCommand extends ActiveOrSuspendedWorkspaceCommandRunner {
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

    const { twentyStandardFlatApplication } =
      await this.applicationService.findWorkspaceTwentyStandardAndCustomApplicationOrThrow(
        { workspaceId },
      );

    const { flatPageLayoutWidgetMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatPageLayoutWidgetMaps',
      ]);

    const widgetsToBackfill = Object.values(
      flatPageLayoutWidgetMaps.byUniversalIdentifier,
    )
      .filter(isDefined)
      .filter(
        (widget) =>
          widget.applicationUniversalIdentifier ===
            twentyStandardFlatApplication.universalIdentifier &&
          widget.configuration?.configurationType ===
            WidgetConfigurationType.FIELDS &&
          !isDefined(widget.configuration.newFieldDefaultVisibility),
      );

    if (widgetsToBackfill.length === 0) {
      this.logger.log(
        `No standard FIELDS widgets to backfill in workspace ${workspaceId}`,
      );

      return;
    }

    if (isDryRun) {
      this.logger.log(
        `[DRY RUN] Would backfill ${widgetsToBackfill.length} standard FIELDS widget(s) in workspace ${workspaceId}`,
      );

      return;
    }

    const updatedWidgets: FlatPageLayoutWidget[] = widgetsToBackfill.map(
      (widget) => ({
        ...widget,
        configuration: {
          ...widget.configuration,
          newFieldDefaultVisibility: true,
        },
        universalConfiguration: isDefined(widget.universalConfiguration)
          ? {
              ...widget.universalConfiguration,
              newFieldDefaultVisibility: true,
            }
          : widget.universalConfiguration,
      }),
    );

    const result =
      await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunWorkspaceMigration(
        {
          allFlatEntityOperationByMetadataName: {
            pageLayoutWidget: {
              flatEntityToCreate: [],
              flatEntityToDelete: [],
              flatEntityToUpdate: updatedWidgets,
            },
          },
          workspaceId,
          applicationUniversalIdentifier:
            twentyStandardFlatApplication.universalIdentifier,
        },
      );

    if (result.status === 'fail') {
      this.logger.error(
        `Failed to backfill FIELDS widgets in workspace ${workspaceId}:\n${JSON.stringify(result, null, 2)}`,
      );
      throw new Error(
        `Failed to backfill FIELDS widgets for workspace ${workspaceId}`,
      );
    }

    this.logger.log(
      `Backfilled ${updatedWidgets.length} standard FIELDS widget(s) for workspace ${workspaceId}`,
    );
  }
}
