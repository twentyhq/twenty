import { Command } from 'nest-commander';
import { isDefined } from 'twenty-shared/utils';

import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { computeCanvasRecordPageTabsToVerticalList } from 'src/database/commands/upgrade-version-command/2-23/utils/compute-canvas-record-page-tabs-to-vertical-list.util';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { type FlatPageLayoutTab } from 'src/engine/metadata-modules/flat-page-layout-tab/types/flat-page-layout-tab.type';
import { type FlatPageLayoutWidget } from 'src/engine/metadata-modules/flat-page-layout-widget/types/flat-page-layout-widget.type';
import { PageLayoutType } from 'src/engine/metadata-modules/page-layout/enums/page-layout-type.enum';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';

@RegisteredWorkspaceCommand('2.23.0', 1784600000000)
@Command({
  name: 'upgrade:2-23:migrate-canvas-record-page-tabs-to-vertical-list',
  description:
    'Migrate legacy CANVAS record-page tabs to VERTICAL_LIST and give their widgets a vertical-list position, now that solo/stack presentation is derived from content',
})
export class MigrateCanvasRecordPageTabsToVerticalListCommand extends ProvisionedWorkspaceCommandRunner {
  constructor(
    protected readonly workspaceIteratorService: WorkspaceIteratorService,
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

    const { flatPageLayoutMaps, flatPageLayoutTabMaps, flatPageLayoutWidgetMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatPageLayoutMaps',
        'flatPageLayoutTabMaps',
        'flatPageLayoutWidgetMaps',
      ]);

    const recordPageLayoutIds = new Set(
      Object.values(flatPageLayoutMaps.byUniversalIdentifier)
        .filter(isDefined)
        .filter((layout) => layout.type === PageLayoutType.RECORD_PAGE)
        .map((layout) => layout.id),
    );

    const tabs = Object.values(
      flatPageLayoutTabMaps.byUniversalIdentifier,
    ).filter(isDefined);

    const widgets = Object.values(
      flatPageLayoutWidgetMaps.byUniversalIdentifier,
    ).filter(isDefined);

    const { tabsToUpdate, widgetsToUpdate } =
      computeCanvasRecordPageTabsToVerticalList({
        recordPageLayoutIds,
        tabs,
        widgets,
      });

    if (tabsToUpdate.length === 0) {
      this.logger.log(
        `No CANVAS record-page tabs to migrate in workspace ${workspaceId}`,
      );

      return;
    }

    if (isDryRun) {
      this.logger.log(
        `[DRY RUN] Would migrate ${tabsToUpdate.length} CANVAS tab(s) and ${widgetsToUpdate.length} widget(s) in workspace ${workspaceId}`,
      );

      return;
    }

    const applicationUniversalIdentifiers = new Set([
      ...tabsToUpdate.map((tab) => tab.applicationUniversalIdentifier),
      ...widgetsToUpdate.map((widget) => widget.applicationUniversalIdentifier),
    ]);

    for (const applicationUniversalIdentifier of applicationUniversalIdentifiers) {
      const tabsForApplication: FlatPageLayoutTab[] = tabsToUpdate.filter(
        (tab) =>
          tab.applicationUniversalIdentifier === applicationUniversalIdentifier,
      );

      const widgetsForApplication: FlatPageLayoutWidget[] =
        widgetsToUpdate.filter(
          (widget) =>
            widget.applicationUniversalIdentifier ===
            applicationUniversalIdentifier,
        );

      const result =
        await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunLegacyWorkspaceMigration(
          {
            allFlatEntityOperationByMetadataName: {
              pageLayoutTab: {
                flatEntityToCreate: [],
                flatEntityToDelete: [],
                flatEntityToUpdate: tabsForApplication,
              },
              pageLayoutWidget: {
                flatEntityToCreate: [],
                flatEntityToDelete: [],
                flatEntityToUpdate: widgetsForApplication,
              },
            },
            workspaceId,
            applicationUniversalIdentifier,
          },
        );

      if (result.status === 'fail') {
        this.logger.error(
          `Failed to migrate CANVAS record-page tabs for application ${applicationUniversalIdentifier} in workspace ${workspaceId}:\n${JSON.stringify(result, null, 2)}`,
        );
        throw new Error(
          `Failed to migrate CANVAS record-page tabs for workspace ${workspaceId}`,
        );
      }

      this.logger.log(
        `Migrated ${tabsForApplication.length} CANVAS tab(s) and ${widgetsForApplication.length} widget(s) for application ${applicationUniversalIdentifier} in workspace ${workspaceId}`,
      );
    }
  }
}
