import { Command } from 'nest-commander';
import { NavigationMenuItemType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { v4 } from 'uuid';

import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { buildStandardNavigationMenuItemToCreate } from 'src/database/commands/upgrade-version-command/2-53/utils/build-standard-navigation-menu-item-to-create.util';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { type FlatNavigationMenuItem } from 'src/engine/metadata-modules/flat-navigation-menu-item/types/flat-navigation-menu-item.type';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { STANDARD_NAVIGATION_MENU_ITEMS } from 'src/engine/workspace-manager/twenty-standard-application/constants/standard-navigation-menu-item.constant';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';

const HOME_SECTION_TYPES: NavigationMenuItemType[] = [
  NavigationMenuItemType.SECTION,
  NavigationMenuItemType.AI_CHAT_INBOX,
  NavigationMenuItemType.AI_CHAT_FAVORITES,
  NavigationMenuItemType.AI_CHAT_RECENTS,
  NavigationMenuItemType.AI_AGENTS,
  NavigationMenuItemType.AI_CHAT_CHANNELS,
];

const getPositionUnderInbox = (homeSections: FlatNavigationMenuItem[]) => {
  const inboxSectionIndex = homeSections.findIndex(
    (section) => section.type === NavigationMenuItemType.AI_CHAT_INBOX,
  );

  if (inboxSectionIndex === -1) {
    return (homeSections[0]?.position ?? 0) - 1;
  }

  const inboxSection = homeSections[inboxSectionIndex];
  const sectionBelowInbox = homeSections[inboxSectionIndex + 1];

  return isDefined(sectionBelowInbox)
    ? (inboxSection.position + sectionBelowInbox.position) / 2
    : inboxSection.position + 1;
};

@RegisteredWorkspaceCommand('2.53.0', 1793174702022)
@Command({
  name: 'upgrade:2-53:add-favorites-navigation-menu-section',
  description:
    'Place the Favorites section on Home just under the Inbox, for workspaces whose sidebar has none',
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

    const workspaceNavigationMenuItems = Object.values(
      flatNavigationMenuItemMaps.byUniversalIdentifier,
    ).filter(
      (navigationMenuItem): navigationMenuItem is FlatNavigationMenuItem =>
        isDefined(navigationMenuItem) &&
        !isDefined(navigationMenuItem.userWorkspaceId),
    );

    const hasFavoritesSection = workspaceNavigationMenuItems.some(
      (navigationMenuItem) =>
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

    const homeSections = workspaceNavigationMenuItems
      .filter(
        (navigationMenuItem) =>
          !isDefined(navigationMenuItem.folderId) &&
          HOME_SECTION_TYPES.includes(navigationMenuItem.type),
      )
      .sort((sectionA, sectionB) => sectionA.position - sectionB.position);

    const now = new Date().toISOString();
    const favoritesSection = STANDARD_NAVIGATION_MENU_ITEMS.favoritesSection;

    const favoritesSectionToCreate = buildStandardNavigationMenuItemToCreate({
      id: v4(),
      universalIdentifier: favoritesSection.universalIdentifier,
      type: favoritesSection.type,
      position: getPositionUnderInbox(homeSections),
      workspaceId,
      twentyStandardFlatApplication,
      now,
    });

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
