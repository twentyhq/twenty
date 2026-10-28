import { Command } from 'nest-commander';
import { FeatureFlagKey, NavigationMenuItemType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { v4 } from 'uuid';

import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { FeatureFlagService } from 'src/engine/core-modules/feature-flag/services/feature-flag.service';
import { buildStandardNavigationMenuItemToCreate } from 'src/database/commands/upgrade-version-command/2-53/utils/build-standard-navigation-menu-item-to-create.util';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { STANDARD_NAVIGATION_MENU_ITEMS } from 'src/engine/workspace-manager/twenty-standard-application/constants/standard-navigation-menu-item.constant';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';

const DEFAULT_PINNED_COMMANDS = [
  STANDARD_NAVIGATION_MENU_ITEMS.pinnedCommandsSearch,
  STANDARD_NAVIGATION_MENU_ITEMS.pinnedCommandsNewChat,
];

@RegisteredWorkspaceCommand('2.53.0', 1793174702020)
@Command({
  name: 'upgrade:2-53:add-pinned-navigation-menu-commands',
  description:
    'Pin Search and New chat at the top of the sidebar, for workspaces that have no pinned commands',
})
export class AddPinnedNavigationMenuCommandsCommand extends ProvisionedWorkspaceCommandRunner {
  constructor(
    protected readonly workspaceIteratorService: WorkspaceIteratorService,
    private readonly applicationService: ApplicationService,
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly workspaceMigrationValidateBuildAndRunService: WorkspaceMigrationValidateBuildAndRunService,
    private readonly featureFlagService: FeatureFlagService,
  ) {
    super(workspaceIteratorService);
  }

  override async runOnWorkspace({
    workspaceId,
    options,
  }: RunOnWorkspaceArgs): Promise<void> {
    const isCustomizableSidebarEnabled =
      await this.featureFlagService.isFeatureEnabled(
        FeatureFlagKey.IS_CUSTOMIZABLE_SIDEBAR_ENABLED,
        workspaceId,
      );

    if (!isCustomizableSidebarEnabled) {
      this.logger.log(
        `Customizable sidebar disabled for workspace ${workspaceId}, skipping`,
      );

      return;
    }

    const { flatNavigationMenuItemMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatNavigationMenuItemMaps',
      ]);

    const hasPinnedCommands = Object.values(
      flatNavigationMenuItemMaps.byUniversalIdentifier,
    ).some(
      (navigationMenuItem) =>
        isDefined(navigationMenuItem) &&
        !isDefined(navigationMenuItem.userWorkspaceId) &&
        navigationMenuItem.type === NavigationMenuItemType.PINNED_COMMANDS,
    );

    if (hasPinnedCommands) {
      this.logger.log(
        `Pinned commands already present for workspace ${workspaceId}, skipping`,
      );

      return;
    }

    if (options.dryRun) {
      this.logger.log(
        `[DRY RUN] Would pin the default commands for workspace ${workspaceId}`,
      );

      return;
    }

    const { twentyStandardFlatApplication } =
      await this.applicationService.findWorkspaceTwentyStandardAndCustomApplicationOrThrow(
        { workspaceId },
      );

    const now = new Date().toISOString();

    const creationContext = {
      workspaceId,
      twentyStandardFlatApplication,
      now,
    };
    const pinnedCommands = STANDARD_NAVIGATION_MENU_ITEMS.pinnedCommands;
    const pinnedCommandsId = v4();

    const flatNavigationMenuItemsToCreate = [
      buildStandardNavigationMenuItemToCreate({
        ...creationContext,
        id: pinnedCommandsId,
        universalIdentifier: pinnedCommands.universalIdentifier,
        type: pinnedCommands.type,
        position: pinnedCommands.position,
      }),
      ...DEFAULT_PINNED_COMMANDS.map((command) =>
        buildStandardNavigationMenuItemToCreate({
          ...creationContext,
          id: v4(),
          universalIdentifier: command.universalIdentifier,
          type: command.type,
          folderId: pinnedCommandsId,
          folderUniversalIdentifier: command.folderUniversalIdentifier,
          position: command.position,
          commandKey: command.commandKey,
        }),
      ),
    ];

    const validateAndBuildResult =
      await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunLegacyWorkspaceMigration(
        {
          isSystemBuild: true,
          workspaceId,
          applicationUniversalIdentifier:
            twentyStandardFlatApplication.universalIdentifier,
          allFlatEntityOperationByMetadataName: {
            navigationMenuItem: {
              flatEntityToCreate: flatNavigationMenuItemsToCreate,
              flatEntityToDelete: [],
              flatEntityToUpdate: [],
            },
          },
        },
      );

    if (validateAndBuildResult.status === 'fail') {
      this.logger.error(
        `Failed to pin the default commands:\n${JSON.stringify(validateAndBuildResult, null, 2)}`,
      );

      throw new Error(
        `Failed to pin the default commands for workspace ${workspaceId}`,
      );
    }

    this.logger.log(`Pinned the default commands for workspace ${workspaceId}`);
  }
}
