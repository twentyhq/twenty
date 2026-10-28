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

const INBOX_AND_CHATS_SECTION_TYPES: NavigationMenuItemType[] = [
  NavigationMenuItemType.AI_CHAT_INBOX,
  NavigationMenuItemType.AI_CHAT_FAVORITES,
  NavigationMenuItemType.AI_CHAT_CHANNELS,
  NavigationMenuItemType.AI_CHAT_RECENTS,
];

const CHATS_TAB_SECTION_DEFINITIONS = [
  STANDARD_NAVIGATION_MENU_ITEMS.chatsTabFavoriteChats,
  STANDARD_NAVIGATION_MENU_ITEMS.chatsTabChannels,
  STANDARD_NAVIGATION_MENU_ITEMS.chatsTabRecentChats,
];

@RegisteredWorkspaceCommand('2.53.0', 1793174702016)
@Command({
  name: 'upgrade:2-53:add-inbox-and-chats-navigation-menu-items',
  description:
    'Add the Inbox section to Home and the Chats tab, holding the favorite chats, channels and recent chats sections, to workspaces whose sidebar has none of them',
})
export class AddInboxAndChatsNavigationMenuItemsCommand extends ProvisionedWorkspaceCommandRunner {
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

    const hasInboxOrChats = Object.values(
      flatNavigationMenuItemMaps.byUniversalIdentifier,
    )
      .filter(isDefined)
      .some(
        (navigationMenuItem) =>
          navigationMenuItem.universalIdentifier ===
            STANDARD_NAVIGATION_MENU_ITEMS.chatsTab.universalIdentifier ||
          INBOX_AND_CHATS_SECTION_TYPES.includes(navigationMenuItem.type),
      );

    if (hasInboxOrChats) {
      this.logger.log(
        `Inbox section or Chats tab already present for workspace ${workspaceId}, skipping`,
      );

      return;
    }

    if (options.dryRun) {
      this.logger.log(
        `[DRY RUN] Would add the Inbox section and the Chats tab for workspace ${workspaceId}`,
      );

      return;
    }

    const { twentyStandardFlatApplication } =
      await this.applicationService.findWorkspaceTwentyStandardAndCustomApplicationOrThrow(
        { workspaceId },
      );

    const now = new Date().toISOString();
    const chatsTabId = v4();

    const creationContext = {
      workspaceId,
      twentyStandardFlatApplication,
      now,
    };

    const { inboxSection, chatsTab } = STANDARD_NAVIGATION_MENU_ITEMS;

    const flatNavigationMenuItemsToCreate = [
      buildStandardNavigationMenuItemToCreate({
        ...creationContext,
        id: v4(),
        universalIdentifier: inboxSection.universalIdentifier,
        type: inboxSection.type,
        position: inboxSection.position,
      }),
      buildStandardNavigationMenuItemToCreate({
        ...creationContext,
        id: chatsTabId,
        universalIdentifier: chatsTab.universalIdentifier,
        type: chatsTab.type,
        name: chatsTab.name,
        icon: chatsTab.icon,
        position: chatsTab.position,
      }),
      ...CHATS_TAB_SECTION_DEFINITIONS.map((chatsTabSection) =>
        buildStandardNavigationMenuItemToCreate({
          ...creationContext,
          id: v4(),
          universalIdentifier: chatsTabSection.universalIdentifier,
          type: chatsTabSection.type,
          folderId: chatsTabId,
          folderUniversalIdentifier: chatsTabSection.folderUniversalIdentifier,
          position: chatsTabSection.position,
          visibleItemLimit: chatsTabSection.visibleItemLimit,
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
        `Failed to add the Inbox section and the Chats tab:\n${JSON.stringify(validateAndBuildResult, null, 2)}`,
      );

      throw new Error(
        `Failed to add the Inbox section and the Chats tab for workspace ${workspaceId}`,
      );
    }

    this.logger.log(
      `Added the Inbox section and the Chats tab for workspace ${workspaceId}`,
    );
  }
}
