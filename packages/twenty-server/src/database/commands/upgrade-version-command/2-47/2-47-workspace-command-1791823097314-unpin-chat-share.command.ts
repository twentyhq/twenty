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

const CHAT_SHARE_UNIVERSAL_IDENTIFIER = 'b9336f9f-d10c-42c0-b7cd-40c94ae235ef';

const FLAGGED_CHAT_SHARE = {
  isPinned: true,
  conditionalAvailabilityExpression:
    'numberOfSelectedRecords == 1 and (featureFlags.IS_AI_CHAT_SHARING_DROPDOWN_ENABLED or featureFlags.IS_RECORD_LEVEL_SHARING_ENABLED) and noneDefined(selectedRecords, "deletedAt")',
};

const UNPINNED_CHAT_SHARE = {
  isPinned: false,
  conditionalAvailabilityExpression:
    'numberOfSelectedRecords == 1 and noneDefined(selectedRecords, "deletedAt")',
};

@RegisteredWorkspaceCommand('2.47.0', 1791823097314)
@Command({
  name: 'upgrade:2-47:unpin-chat-share',
  description:
    'Move the chat Share item to the actions menu and drop its sharing dropdown flag',
})
export class UnpinChatShareCommand extends ProvisionedWorkspaceCommandRunner {
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
    await this.moveChatShare({
      ...args,
      from: FLAGGED_CHAT_SHARE,
      to: UNPINNED_CHAT_SHARE,
    });
  }

  async down(args: RunOnWorkspaceArgs): Promise<void> {
    await this.moveChatShare({
      ...args,
      from: UNPINNED_CHAT_SHARE,
      to: FLAGGED_CHAT_SHARE,
    });
  }

  private async moveChatShare({
    workspaceId,
    options,
    from,
    to,
  }: RunOnWorkspaceArgs & {
    from: typeof FLAGGED_CHAT_SHARE;
    to: typeof FLAGGED_CHAT_SHARE;
  }): Promise<void> {
    const { flatCommandMenuItemMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatCommandMenuItemMaps',
      ]);

    const chatShare =
      flatCommandMenuItemMaps.byUniversalIdentifier[
        CHAT_SHARE_UNIVERSAL_IDENTIFIER
      ];

    // A Share item the workspace changed keeps its version
    if (
      !isDefined(chatShare) ||
      chatShare.isPinned !== from.isPinned ||
      chatShare.conditionalAvailabilityExpression !==
        from.conditionalAvailabilityExpression
    ) {
      return;
    }

    this.logger.log(
      `${options.dryRun ? '[DRY RUN] ' : ''}Workspace ${workspaceId}: ${to.isPinned ? 'pinning' : 'unpinning'} the chat Share item`,
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
                { ...chatShare, ...to, updatedAt: new Date().toISOString() },
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
