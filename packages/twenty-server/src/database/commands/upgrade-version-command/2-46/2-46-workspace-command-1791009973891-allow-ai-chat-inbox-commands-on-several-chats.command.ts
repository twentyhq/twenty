import { Command } from 'nest-commander';
import { TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER } from 'twenty-shared/application';
import { isDefined } from 'twenty-shared/utils';

import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { STANDARD_COMMAND_MENU_ITEMS } from 'src/engine/workspace-manager/twenty-standard-application/constants/standard-command-menu-item.constant';
import { WorkspaceMigrationBuilderException } from 'src/engine/workspace-manager/workspace-migration/exceptions/workspace-migration-builder-exception';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';

const INBOX_COMMAND_MENU_ITEM_NAMES = [
  'markAiChatAsRead',
  'markAiChatAsUnread',
  'markAiChatAsDone',
  'reopenAiChat',
  'unsnoozeAiChat',
  'snoozeAiChat',
] as const;

const ONE_CHAT_CONDITION = 'numberOfSelectedRecords == 1 ';
const SEVERAL_CHATS_CONDITION = 'numberOfSelectedRecords >= 1 ';

@RegisteredWorkspaceCommand('2.46.0', 1791009973891)
@Command({
  name: 'upgrade:2-46:allow-ai-chat-inbox-commands-on-several-chats',
  description:
    'Offer the inbox commands when several chats are selected, for workspaces that got them for a single chat',
})
export class AllowAiChatInboxCommandsOnSeveralChatsCommand extends ProvisionedWorkspaceCommandRunner {
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
    await this.replaceCondition(args, {
      from: ONE_CHAT_CONDITION,
      to: SEVERAL_CHATS_CONDITION,
    });
  }

  async down(args: RunOnWorkspaceArgs): Promise<void> {
    await this.replaceCondition(args, {
      from: SEVERAL_CHATS_CONDITION,
      to: ONE_CHAT_CONDITION,
    });
  }

  private async replaceCondition(
    { workspaceId, options }: RunOnWorkspaceArgs,
    { from, to }: { from: string; to: string },
  ): Promise<void> {
    const { flatCommandMenuItemMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatCommandMenuItemMaps',
      ]);

    const commandMenuItemsToUpdate = INBOX_COMMAND_MENU_ITEM_NAMES.map(
      (name) =>
        flatCommandMenuItemMaps.byUniversalIdentifier[
          STANDARD_COMMAND_MENU_ITEMS[name].universalIdentifier
        ],
    ).filter(
      (commandMenuItem) =>
        isDefined(commandMenuItem) &&
        commandMenuItem.conditionalAvailabilityExpression?.startsWith(from) ===
          true,
    );

    if (commandMenuItemsToUpdate.length === 0) {
      return;
    }

    this.logger.log(
      `${options.dryRun ? '[DRY RUN] ' : ''}Workspace ${workspaceId}: updating ${commandMenuItemsToUpdate.length} inbox command menu item(s)`,
    );

    if (options.dryRun) {
      return;
    }

    const updatedAt = new Date().toISOString();

    const result =
      await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunLegacyWorkspaceMigration(
        {
          workspaceId,
          isSystemBuild: true,
          applicationUniversalIdentifier:
            TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER,
          allFlatEntityOperationByMetadataName: {
            commandMenuItem: {
              flatEntityToCreate: [],
              flatEntityToDelete: [],
              flatEntityToUpdate: commandMenuItemsToUpdate
                .filter(isDefined)
                .map((commandMenuItem) => ({
                  ...commandMenuItem,
                  conditionalAvailabilityExpression:
                    commandMenuItem.conditionalAvailabilityExpression?.replace(
                      from,
                      to,
                    ) ?? null,
                  updatedAt,
                })),
            },
          },
        },
      );

    if (result.status === 'fail') {
      throw new WorkspaceMigrationBuilderException(result);
    }
  }
}
