import { Command } from 'nest-commander';

import { isDefined } from 'twenty-shared/utils';

import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { STANDARD_NAVIGATION_MENU_ITEMS } from 'src/engine/workspace-manager/twenty-standard-application/constants/standard-navigation-menu-item.constant';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';

const ALL_MESSAGE_CAMPAIGNS_NAVIGATION_MENU_ITEM_UNIVERSAL_IDENTIFIER =
  STANDARD_NAVIGATION_MENU_ITEMS.allMessageCampaigns.universalIdentifier;

@RegisteredWorkspaceCommand('2.25.0', 1785332550000)
@Command({
  name: 'upgrade:2-25:remove-message-campaign-navigation-menu-item',
  description:
    'Remove the Campaigns navigation menu item from workspaces provisioned while it was built unconditionally, since navigation items cannot be gated behind IS_EMAIL_GROUP_ENABLED yet',
})
export class RemoveMessageCampaignNavigationMenuItemCommand extends ProvisionedWorkspaceCommandRunner {
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

    const { flatNavigationMenuItemMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatNavigationMenuItemMaps',
      ]);

    // Every user workspace gets its own row, so collect them all rather than
    // looking the identifier up once.
    const navigationMenuItemsToDelete = Object.values(
      flatNavigationMenuItemMaps.byUniversalIdentifier,
    )
      .filter(isDefined)
      .filter(
        (navigationMenuItem) =>
          navigationMenuItem.universalIdentifier ===
          ALL_MESSAGE_CAMPAIGNS_NAVIGATION_MENU_ITEM_UNIVERSAL_IDENTIFIER,
      );

    if (navigationMenuItemsToDelete.length === 0) {
      this.logger.log(
        `Campaigns navigation menu item not present for workspace ${workspaceId}, skipping`,
      );

      return;
    }

    this.logger.log(
      `${isDryRun ? '[DRY RUN] ' : ''}Removing ${navigationMenuItemsToDelete.length} Campaigns navigation menu item(s) for workspace ${workspaceId}`,
    );

    if (isDryRun) {
      return;
    }

    const { twentyStandardFlatApplication } =
      await this.applicationService.findWorkspaceTwentyStandardAndCustomApplicationOrThrow(
        { workspaceId },
      );

    const validateAndBuildResult =
      await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunLegacyWorkspaceMigration(
        {
          isSystemBuild: true,
          workspaceId,
          applicationUniversalIdentifier:
            twentyStandardFlatApplication.universalIdentifier,
          allFlatEntityOperationByMetadataName: {
            navigationMenuItem: {
              flatEntityToCreate: [],
              flatEntityToDelete: navigationMenuItemsToDelete,
              flatEntityToUpdate: [],
            },
          },
        },
      );

    if (validateAndBuildResult.status === 'fail') {
      this.logger.error(
        `Failed to remove the Campaigns navigation menu item:\n${JSON.stringify(validateAndBuildResult, null, 2)}`,
      );

      throw new Error(
        `Failed to remove the Campaigns navigation menu item for workspace ${workspaceId}`,
      );
    }

    this.logger.log(
      `Removed the Campaigns navigation menu item for workspace ${workspaceId}`,
    );
  }
}
