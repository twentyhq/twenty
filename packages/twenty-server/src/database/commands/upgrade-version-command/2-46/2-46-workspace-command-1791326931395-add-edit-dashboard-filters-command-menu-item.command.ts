import { Command } from 'nest-commander';
import { TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER } from 'twenty-shared/application';
import { isDefined } from 'twenty-shared/utils';

import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { buildMissingStandardCommandMenuItemsToCreate } from 'src/database/commands/upgrade-version-command/2-39/utils/build-missing-standard-command-menu-items-to-create.util';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { STANDARD_COMMAND_MENU_ITEMS } from 'src/engine/workspace-manager/twenty-standard-application/constants/standard-command-menu-item.constant';
import { WorkspaceMigrationBuilderException } from 'src/engine/workspace-manager/workspace-migration/exceptions/workspace-migration-builder-exception';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';

const EDIT_DASHBOARD_FILTERS_COMMAND_MENU_ITEM_NAME = 'editDashboardFilters';

@RegisteredWorkspaceCommand('2.46.0', 1791326931395)
@Command({
  name: 'upgrade:2-46:add-edit-dashboard-filters-command-menu-item',
  description:
    'Add the Dashboard Filters command, shown while a dashboard layout is being edited',
})
export class AddEditDashboardFiltersCommandMenuItemCommand extends ProvisionedWorkspaceCommandRunner {
  constructor(
    protected readonly workspaceIteratorService: WorkspaceIteratorService,
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly workspaceMigrationValidateBuildAndRunService: WorkspaceMigrationValidateBuildAndRunService,
  ) {
    super(workspaceIteratorService);
  }

  override async runOnWorkspace(args: RunOnWorkspaceArgs): Promise<void> {
    await this.up(args);
  }

  async up(args: RunOnWorkspaceArgs): Promise<void> {
    await this.apply(args, 'up');
  }

  async down(args: RunOnWorkspaceArgs): Promise<void> {
    await this.apply(args, 'down');
  }

  private async apply(
    { workspaceId, options }: RunOnWorkspaceArgs,
    direction: 'up' | 'down',
  ): Promise<void> {
    const { flatCommandMenuItemMaps, flatObjectMetadataMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatCommandMenuItemMaps',
        'flatObjectMetadataMaps',
      ]);

    const commandMenuItemsToCreate =
      direction === 'up'
        ? buildMissingStandardCommandMenuItemsToCreate({
            commandMenuItemNames: [EDIT_DASHBOARD_FILTERS_COMMAND_MENU_ITEM_NAME],
            flatCommandMenuItemByUniversalIdentifier:
              flatCommandMenuItemMaps.byUniversalIdentifier,
            flatObjectMetadataMaps,
            workspaceId,
            now: new Date().toISOString(),
          })
        : [];
    const commandMenuItemsToDelete =
      direction === 'down'
        ? [
            flatCommandMenuItemMaps.byUniversalIdentifier[
              STANDARD_COMMAND_MENU_ITEMS[
                EDIT_DASHBOARD_FILTERS_COMMAND_MENU_ITEM_NAME
              ].universalIdentifier
            ],
          ].filter(isDefined)
        : [];

    if (
      commandMenuItemsToCreate.length + commandMenuItemsToDelete.length ===
      0
    ) {
      return;
    }

    this.logger.log(
      `${options.dryRun ? '[DRY RUN] ' : ''}Workspace ${workspaceId} (${direction}): creating ${commandMenuItemsToCreate.length} and deleting ${commandMenuItemsToDelete.length} dashboard filters command menu item(s)`,
    );

    if (options.dryRun) {
      return;
    }

    const result =
      await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunLegacyWorkspaceMigration(
        {
          workspaceId,
          isSystemBuild: true,
          applicationUniversalIdentifier:
            TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER,
          allFlatEntityOperationByMetadataName: {
            commandMenuItem: {
              flatEntityToCreate: commandMenuItemsToCreate,
              flatEntityToDelete: commandMenuItemsToDelete,
              flatEntityToUpdate: [],
            },
          },
        },
      );

    if (result.status === 'fail') {
      throw new WorkspaceMigrationBuilderException(result);
    }
  }
}
