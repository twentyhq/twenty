import { Command } from 'nest-commander';
import { TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER } from 'twenty-shared/application';
import { isDefined } from 'twenty-shared/utils';

import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { buildMissingStandardCommandMenuItemsToCreate } from 'src/database/commands/upgrade-version-command/2-39/utils/build-missing-standard-command-menu-items-to-create.util';
import { buildChatCommandMenuItemAvailabilityUpdates } from 'src/database/commands/upgrade-version-command/2-44/utils/build-chat-command-menu-item-availability-updates.util';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { STANDARD_COMMAND_MENU_ITEMS } from 'src/engine/workspace-manager/twenty-standard-application/constants/standard-command-menu-item.constant';
import { WorkspaceMigrationBuilderException } from 'src/engine/workspace-manager/workspace-migration/exceptions/workspace-migration-builder-exception';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';

const CHAT_COMMAND_MENU_ITEM_NAMES = ['newAiChat', 'shareRecord'] as const;

@RegisteredWorkspaceCommand('2.44.0', 1790710942137)
@Command({
  name: 'upgrade:2-44:add-chat-record-page-command-menu-items',
  description:
    'Add the New chat and Share commands to the chat page, and hide Ask AI and record navigation there',
})
export class AddChatRecordPageCommandMenuItemsCommand extends ProvisionedWorkspaceCommandRunner {
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
    const now = new Date().toISOString();

    const commandMenuItemsToCreate =
      direction === 'up'
        ? buildMissingStandardCommandMenuItemsToCreate({
            commandMenuItemNames: [...CHAT_COMMAND_MENU_ITEM_NAMES],
            flatCommandMenuItemByUniversalIdentifier:
              flatCommandMenuItemMaps.byUniversalIdentifier,
            flatObjectMetadataMaps,
            workspaceId,
            now,
          })
        : [];
    const commandMenuItemsToDelete =
      direction === 'down'
        ? CHAT_COMMAND_MENU_ITEM_NAMES.map(
            (name) =>
              flatCommandMenuItemMaps.byUniversalIdentifier[
                STANDARD_COMMAND_MENU_ITEMS[name].universalIdentifier
              ],
          ).filter(isDefined)
        : [];
    const commandMenuItemsToUpdate =
      buildChatCommandMenuItemAvailabilityUpdates({
        flatCommandMenuItemsByUniversalIdentifier:
          flatCommandMenuItemMaps.byUniversalIdentifier,
        now,
        direction,
      });

    if (
      commandMenuItemsToCreate.length +
        commandMenuItemsToDelete.length +
        commandMenuItemsToUpdate.length ===
      0
    ) {
      return;
    }

    this.logger.log(
      `${options.dryRun ? '[DRY RUN] ' : ''}Workspace ${workspaceId} (${direction}): creating ${commandMenuItemsToCreate.length}, deleting ${commandMenuItemsToDelete.length} and updating ${commandMenuItemsToUpdate.length} chat command menu item(s)`,
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
              flatEntityToUpdate: commandMenuItemsToUpdate,
            },
          },
        },
      );

    if (result.status === 'fail') {
      throw new WorkspaceMigrationBuilderException(result);
    }
  }
}
