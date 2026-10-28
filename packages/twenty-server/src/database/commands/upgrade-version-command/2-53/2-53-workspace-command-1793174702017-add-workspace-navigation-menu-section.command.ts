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
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { STANDARD_NAVIGATION_MENU_ITEMS } from 'src/engine/workspace-manager/twenty-standard-application/constants/standard-navigation-menu-item.constant';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';

const TAB_AND_SECTION_TYPES: NavigationMenuItemType[] = [
  NavigationMenuItemType.TAB,
  NavigationMenuItemType.SECTION,
  NavigationMenuItemType.AI_CHAT_INBOX,
  NavigationMenuItemType.AI_CHAT_FAVORITES,
  NavigationMenuItemType.AI_CHAT_RECENTS,
  NavigationMenuItemType.AI_AGENTS,
  NavigationMenuItemType.AI_CHAT_CHANNELS,
];

@RegisteredWorkspaceCommand('2.53.0', 1793174702017)
@Command({
  name: 'upgrade:2-53:add-workspace-navigation-menu-section',
  description:
    'Add the Workspace sidebar section and move the workspace items listed at the root of Home into it',
})
export class AddWorkspaceNavigationMenuSectionCommand extends ProvisionedWorkspaceCommandRunner {
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

    const workspaceSection = STANDARD_NAVIGATION_MENU_ITEMS.workspaceSection;
    const navigationMenuItems = Object.values(
      flatNavigationMenuItemMaps.byUniversalIdentifier,
    ).filter(isDefined);

    if (
      navigationMenuItems.some(
        (navigationMenuItem) =>
          navigationMenuItem.universalIdentifier ===
          workspaceSection.universalIdentifier,
      )
    ) {
      this.logger.log(
        `Workspace sidebar section already present for workspace ${workspaceId}, skipping`,
      );

      return;
    }

    if (options.dryRun) {
      this.logger.log(
        `[DRY RUN] Would add the Workspace sidebar section for workspace ${workspaceId}`,
      );

      return;
    }

    const { twentyStandardFlatApplication, workspaceCustomFlatApplication } =
      await this.applicationService.findWorkspaceTwentyStandardAndCustomApplicationOrThrow(
        { workspaceId },
      );

    const now = new Date().toISOString();
    const workspaceSectionId = v4();
    const movableApplicationIds = new Set([
      twentyStandardFlatApplication.id,
      workspaceCustomFlatApplication.id,
    ]);

    const workspaceSectionToCreate = buildStandardNavigationMenuItemToCreate({
      id: workspaceSectionId,
      universalIdentifier: workspaceSection.universalIdentifier,
      type: workspaceSection.type,
      name: workspaceSection.name,
      position: workspaceSection.position,
      workspaceId,
      twentyStandardFlatApplication,
      now,
    });

    const rootItemsToMove = navigationMenuItems
      .filter(
        (navigationMenuItem) =>
          !isDefined(navigationMenuItem.userWorkspaceId) &&
          !isDefined(navigationMenuItem.folderId) &&
          !TAB_AND_SECTION_TYPES.includes(navigationMenuItem.type) &&
          movableApplicationIds.has(navigationMenuItem.applicationId),
      )
      .map((navigationMenuItem) => ({
        ...navigationMenuItem,
        folderId: workspaceSectionId,
        folderUniversalIdentifier: workspaceSection.universalIdentifier,
        updatedAt: now,
      }));

    const validateAndBuildResult =
      await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunLegacyWorkspaceMigration(
        {
          isSystemBuild: true,
          workspaceId,
          applicationUniversalIdentifier:
            twentyStandardFlatApplication.universalIdentifier,
          allFlatEntityOperationByMetadataName: {
            navigationMenuItem: {
              flatEntityToCreate: [workspaceSectionToCreate],
              flatEntityToDelete: [],
              flatEntityToUpdate: rootItemsToMove,
            },
          },
        },
      );

    if (validateAndBuildResult.status === 'fail') {
      this.logger.error(
        `Failed to add the Workspace sidebar section:\n${JSON.stringify(validateAndBuildResult, null, 2)}`,
      );

      throw new Error(
        `Failed to add the Workspace sidebar section for workspace ${workspaceId}`,
      );
    }

    this.logger.log(
      `Added the Workspace sidebar section with ${rootItemsToMove.length} items for workspace ${workspaceId}`,
    );
  }
}
