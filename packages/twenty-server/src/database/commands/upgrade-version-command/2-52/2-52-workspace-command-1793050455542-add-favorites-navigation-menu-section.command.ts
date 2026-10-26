import { Command } from 'nest-commander';
import { NavigationMenuItemType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { v4 } from 'uuid';

import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { type FlatNavigationMenuItem } from 'src/engine/metadata-modules/flat-navigation-menu-item/types/flat-navigation-menu-item.type';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { STANDARD_NAVIGATION_MENU_ITEMS } from 'src/engine/workspace-manager/twenty-standard-application/constants/standard-navigation-menu-item.constant';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';

@RegisteredWorkspaceCommand('2.52.0', 1793050455542)
@Command({
  name: 'upgrade:2-52:add-favorites-navigation-menu-section',
  description:
    'Place the Favorites section at the top of Home, for workspaces whose sidebar has none',
})
export class AddFavoritesNavigationMenuSectionCommand extends ProvisionedWorkspaceCommandRunner {
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
    const { flatNavigationMenuItemMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatNavigationMenuItemMaps',
      ]);

    const hasFavoritesSection = Object.values(
      flatNavigationMenuItemMaps.byUniversalIdentifier,
    ).some(
      (navigationMenuItem) =>
        isDefined(navigationMenuItem) &&
        !isDefined(navigationMenuItem.userWorkspaceId) &&
        navigationMenuItem.type === NavigationMenuItemType.FAVORITES,
    );

    if (hasFavoritesSection) {
      this.logger.log(
        `Favorites section already present for workspace ${workspaceId}, skipping`,
      );

      return;
    }

    if (options.dryRun) {
      this.logger.log(
        `[DRY RUN] Would add the Favorites section for workspace ${workspaceId}`,
      );

      return;
    }

    const { twentyStandardFlatApplication } =
      await this.applicationService.findWorkspaceTwentyStandardAndCustomApplicationOrThrow(
        { workspaceId },
      );

    const now = new Date().toISOString();
    const favoritesSection = STANDARD_NAVIGATION_MENU_ITEMS.favoritesSection;

    const favoritesSectionToCreate: FlatNavigationMenuItem = {
      id: v4(),
      universalIdentifier: favoritesSection.universalIdentifier,
      type: favoritesSection.type,
      position: favoritesSection.position,
      applicationId: twentyStandardFlatApplication.id,
      applicationUniversalIdentifier:
        twentyStandardFlatApplication.universalIdentifier,
      workspaceId,
      userWorkspaceId: null,
      folderId: null,
      folderUniversalIdentifier: null,
      targetRecordId: null,
      targetObjectMetadataId: null,
      targetObjectMetadataUniversalIdentifier: null,
      viewId: null,
      viewUniversalIdentifier: null,
      pageLayoutId: null,
      pageLayoutUniversalIdentifier: null,
      agentChatChannelId: null,
      agentChatChannelUniversalIdentifier: null,
      commandKey: null,
      name: null,
      link: null,
      icon: null,
      color: null,
      visibleItemLimit: null,
      createdAt: now,
      updatedAt: now,
    };

    const validateAndBuildResult =
      await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunLegacyWorkspaceMigration(
        {
          isSystemBuild: true,
          workspaceId,
          applicationUniversalIdentifier:
            twentyStandardFlatApplication.universalIdentifier,
          allFlatEntityOperationByMetadataName: {
            navigationMenuItem: {
              flatEntityToCreate: [favoritesSectionToCreate],
              flatEntityToDelete: [],
              flatEntityToUpdate: [],
            },
          },
        },
      );

    if (validateAndBuildResult.status === 'fail') {
      this.logger.error(
        `Failed to add the Favorites section:\n${JSON.stringify(validateAndBuildResult, null, 2)}`,
      );

      throw new Error(
        `Failed to add the Favorites section for workspace ${workspaceId}`,
      );
    }

    this.logger.log(`Added the Favorites section for workspace ${workspaceId}`);
  }
}
