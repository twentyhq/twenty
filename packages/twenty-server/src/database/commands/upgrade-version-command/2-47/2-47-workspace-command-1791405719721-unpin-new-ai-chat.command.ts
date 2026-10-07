import { Command } from 'nest-commander';
import { TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER } from 'twenty-shared/application';
import { isDefined } from 'twenty-shared/utils';

import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { WorkspaceMigrationBuilderException } from 'src/engine/workspace-manager/workspace-migration/exceptions/workspace-migration-builder-exception';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';

const NEW_AI_CHAT_UNIVERSAL_IDENTIFIER = '604bc9b2-e438-4572-bd35-726fa0fb2ec7';

// The inbox triage commands take over the chat header once the inbox ships
// to every workspace
@RegisteredWorkspaceCommand('2.47.0', 1791405719721)
@Command({
  name: 'upgrade:2-47:unpin-new-ai-chat',
  description: 'Unpin New chat from the chat header',
})
export class UnpinNewAiChatCommand extends ProvisionedWorkspaceCommandRunner {
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
    await this.setNewAiChatPinned(args, false);
  }

  async down(args: RunOnWorkspaceArgs): Promise<void> {
    await this.setNewAiChatPinned(args, true);
  }

  private async setNewAiChatPinned(
    { workspaceId, options }: RunOnWorkspaceArgs,
    isPinned: boolean,
  ): Promise<void> {
    const { flatCommandMenuItemMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatCommandMenuItemMaps',
      ]);

    const newAiChat =
      flatCommandMenuItemMaps.byUniversalIdentifier[
        NEW_AI_CHAT_UNIVERSAL_IDENTIFIER
      ];

    if (!isDefined(newAiChat) || newAiChat.isPinned === isPinned) {
      return;
    }

    this.logger.log(
      `${options.dryRun ? '[DRY RUN] ' : ''}Workspace ${workspaceId}: ${isPinned ? 'pinning' : 'unpinning'} New chat`,
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
              flatEntityToCreate: [],
              flatEntityToDelete: [],
              flatEntityToUpdate: [
                {
                  ...newAiChat,
                  isPinned,
                  updatedAt: new Date().toISOString(),
                },
              ],
            },
          },
        },
      );

    if (result.status === 'fail') {
      throw new WorkspaceMigrationBuilderException(result);
    }
  }
}
