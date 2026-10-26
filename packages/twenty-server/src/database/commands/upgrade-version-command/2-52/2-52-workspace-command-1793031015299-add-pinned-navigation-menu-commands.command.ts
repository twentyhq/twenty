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

const PINNED_COMMANDS = [
  {
    container: STANDARD_NAVIGATION_MENU_ITEMS.homeCommands,
    commands: [STANDARD_NAVIGATION_MENU_ITEMS.homeCommandsSearch],
  },
  {
    container: STANDARD_NAVIGATION_MENU_ITEMS.chatsTabCommands,
    commands: [
      STANDARD_NAVIGATION_MENU_ITEMS.chatsTabCommandsNewChat,
      STANDARD_NAVIGATION_MENU_ITEMS.chatsTabCommandsSearch,
    ],
  },
];

@RegisteredWorkspaceCommand('2.52.0', 1793031015299)
@Command({
  name: 'upgrade:2-52:add-pinned-navigation-menu-commands',
  description:
    'Pin the default commands at the top of Home and of the Chats tab, for workspaces where they have none',
})
export class AddPinnedNavigationMenuCommandsCommand extends ProvisionedWorkspaceCommandRunner {
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
    )
      .filter(isDefined)
      .filter((navigationMenuItem) => !isDefined(navigationMenuItem.userWorkspaceId));

    const parentIdsWithCommands = new Set(
      workspaceNavigationMenuItems
        .filter(
          (navigationMenuItem) =>
            navigationMenuItem.type === NavigationMenuItemType.COMMANDS,
        )
        .map((navigationMenuItem) => navigationMenuItem.folderId ?? null),
    );

    const getParent = (folderUniversalIdentifier: string | undefined) =>
      isDefined(folderUniversalIdentifier)
        ? workspaceNavigationMenuItems.find(
            (navigationMenuItem) =>
              navigationMenuItem.universalIdentifier ===
              folderUniversalIdentifier,
          )
        : undefined;

    const pinnedCommandsToAdd = PINNED_COMMANDS.filter(({ container }) => {
      const folderUniversalIdentifier =
        'folderUniversalIdentifier' in container
          ? container.folderUniversalIdentifier
          : undefined;
      const parent = getParent(folderUniversalIdentifier);

      if (isDefined(folderUniversalIdentifier) && !isDefined(parent)) {
        return false;
      }

      return !parentIdsWithCommands.has(parent?.id ?? null);
    });

    if (pinnedCommandsToAdd.length === 0) {
      this.logger.log(
        `Pinned commands already present for workspace ${workspaceId}, skipping`,
      );

      return;
    }

    if (options.dryRun) {
      this.logger.log(
        `[DRY RUN] Would pin the default commands in ${pinnedCommandsToAdd.length} tabs for workspace ${workspaceId}`,
      );

      return;
    }

    const { twentyStandardFlatApplication } =
      await this.applicationService.findWorkspaceTwentyStandardAndCustomApplicationOrThrow(
        { workspaceId },
      );

    const now = new Date().toISOString();

    const buildFlatNavigationMenuItem = (
      navigationMenuItem: Pick<
        FlatNavigationMenuItem,
        | 'id'
        | 'universalIdentifier'
        | 'type'
        | 'folderId'
        | 'folderUniversalIdentifier'
        | 'position'
        | 'commandKey'
      >,
    ): FlatNavigationMenuItem => ({
      ...navigationMenuItem,
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
      pageLayoutId: null,
      pageLayoutUniversalIdentifier: null,
      agentChatChannelId: null,
      agentChatChannelUniversalIdentifier: null,
      name: null,
      link: null,
      icon: null,
      color: null,
      visibleItemLimit: null,
      createdAt: now,
      updatedAt: now,
    });

    const flatNavigationMenuItemsToCreate = pinnedCommandsToAdd.flatMap(
      ({ container, commands }) => {
        const parent = getParent(
          'folderUniversalIdentifier' in container
            ? container.folderUniversalIdentifier
            : undefined,
        );
        const parentId = parent?.id ?? null;
        const siblingPositions = workspaceNavigationMenuItems
          .filter(
            (navigationMenuItem) =>
              (navigationMenuItem.folderId ?? null) === parentId &&
              navigationMenuItem.type !== NavigationMenuItemType.TAB,
          )
          .map((navigationMenuItem) => navigationMenuItem.position);
        const containerId = v4();

        return [
          buildFlatNavigationMenuItem({
            id: containerId,
            universalIdentifier: container.universalIdentifier,
            type: container.type,
            folderId: parentId,
            folderUniversalIdentifier: parent?.universalIdentifier ?? null,
            position: Math.min(
              container.position,
              ...siblingPositions.map((position) => position - 1),
            ),
            commandKey: null,
          }),
          ...commands.map((command) =>
            buildFlatNavigationMenuItem({
              id: v4(),
              universalIdentifier: command.universalIdentifier,
              type: command.type,
              folderId: containerId,
              folderUniversalIdentifier: command.folderUniversalIdentifier,
              position: command.position,
              commandKey: command.commandKey,
            }),
          ),
        ];
      },
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

    this.logger.log(
      `Pinned the default commands in ${pinnedCommandsToAdd.length} tabs for workspace ${workspaceId}`,
    );
  }
}
