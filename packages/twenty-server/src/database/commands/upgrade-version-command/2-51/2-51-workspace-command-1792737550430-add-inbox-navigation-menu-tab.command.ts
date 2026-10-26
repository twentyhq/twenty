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

const INBOX_SECTION_TYPES: string[] = [
  NavigationMenuItemType.AI_CHAT_TRIAGE,
  NavigationMenuItemType.AI_CHAT_FAVORITES,
  NavigationMenuItemType.AI_CHAT_RECENTS,
];

const INBOX_SECTION_DEFINITIONS = [
  STANDARD_NAVIGATION_MENU_ITEMS.inboxTabTriage,
  STANDARD_NAVIGATION_MENU_ITEMS.inboxTabFavoriteChats,
  STANDARD_NAVIGATION_MENU_ITEMS.inboxTabRecentChats,
];

@RegisteredWorkspaceCommand('2.51.0', 1792737550430)
@Command({
  name: 'upgrade:2-51:add-inbox-navigation-menu-tab',
  description:
    'Add the Inbox sidebar tab, holding the triage, favorite chats and recent chats sections, to workspaces whose sidebar has none of them',
})
export class AddInboxNavigationMenuTabCommand extends ProvisionedWorkspaceCommandRunner {
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

    const hasInbox = Object.values(
      flatNavigationMenuItemMaps.byUniversalIdentifier,
    )
      .filter(isDefined)
      .some(
        (navigationMenuItem) =>
          navigationMenuItem.universalIdentifier ===
            STANDARD_NAVIGATION_MENU_ITEMS.inboxTab.universalIdentifier ||
          INBOX_SECTION_TYPES.includes(navigationMenuItem.type),
      );

    if (hasInbox) {
      this.logger.log(
        `Inbox sidebar tab already present for workspace ${workspaceId}, skipping`,
      );

      return;
    }

    if (options.dryRun) {
      this.logger.log(
        `[DRY RUN] Would add the Inbox sidebar tab for workspace ${workspaceId}`,
      );

      return;
    }

    const { twentyStandardFlatApplication } =
      await this.applicationService.findWorkspaceTwentyStandardAndCustomApplicationOrThrow(
        { workspaceId },
      );

    const now = new Date().toISOString();
    const inboxTabId = v4();

    const buildFlatNavigationMenuItem = ({
      id,
      universalIdentifier,
      type,
      name,
      icon,
      folderId,
      folderUniversalIdentifier,
      position,
    }: Pick<
      FlatNavigationMenuItem,
      | 'id'
      | 'universalIdentifier'
      | 'type'
      | 'name'
      | 'icon'
      | 'folderId'
      | 'folderUniversalIdentifier'
      | 'position'
    >): FlatNavigationMenuItem => ({
      id,
      type,
      universalIdentifier,
      applicationId: twentyStandardFlatApplication.id,
      applicationUniversalIdentifier:
        twentyStandardFlatApplication.universalIdentifier,
      workspaceId,
      userWorkspaceId: null,
      targetRecordId: null,
      targetObjectMetadataId: null,
      targetObjectMetadataUniversalIdentifier: null,
      viewId: null,
      viewUniversalIdentifier: null,
      folderId,
      folderUniversalIdentifier,
      pageLayoutId: null,
      pageLayoutUniversalIdentifier: null,
      agentChatChannelId: null,
      agentChatChannelUniversalIdentifier: null,
      name,
      link: null,
      icon,
      color: null,
      position,
      createdAt: now,
      updatedAt: now,
    });

    const inboxTab = STANDARD_NAVIGATION_MENU_ITEMS.inboxTab;

    const flatNavigationMenuItemsToCreate = [
      buildFlatNavigationMenuItem({
        id: inboxTabId,
        universalIdentifier: inboxTab.universalIdentifier,
        type: inboxTab.type,
        name: inboxTab.name,
        icon: inboxTab.icon,
        folderId: null,
        folderUniversalIdentifier: null,
        position: inboxTab.position,
      }),
      ...INBOX_SECTION_DEFINITIONS.map((inboxSection) =>
        buildFlatNavigationMenuItem({
          id: v4(),
          universalIdentifier: inboxSection.universalIdentifier,
          type: inboxSection.type,
          name: null,
          icon: null,
          folderId: inboxTabId,
          folderUniversalIdentifier: inboxSection.folderUniversalIdentifier,
          position: inboxSection.position,
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
        `Failed to add the Inbox sidebar tab:\n${JSON.stringify(validateAndBuildResult, null, 2)}`,
      );

      throw new Error(
        `Failed to add the Inbox sidebar tab for workspace ${workspaceId}`,
      );
    }

    this.logger.log(`Added the Inbox sidebar tab for workspace ${workspaceId}`);
  }
}
