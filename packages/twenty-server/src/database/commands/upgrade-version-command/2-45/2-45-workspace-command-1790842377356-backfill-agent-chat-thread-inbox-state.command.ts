import { Command } from 'nest-commander';
import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { isDefined } from 'twenty-shared/utils';

import { AgentHistoryUpgradeStorageService } from 'src/database/commands/agent-history/agent-history-upgrade-storage.service';
import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { backfillAgentChatThreadInboxState } from 'src/database/commands/upgrade-version-command/2-45/utils/backfill-agent-chat-thread-inbox-state.util';
import { moveRestoredArchivedChatThreadsBackToTrash } from 'src/database/commands/upgrade-version-command/2-45/utils/move-restored-archived-chat-threads-back-to-trash.util';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

@RegisteredWorkspaceCommand('2.45.0', 1790842377356)
@Command({
  name: 'upgrade:2-45:backfill-agent-chat-thread-inbox-state',
  description:
    'Backfill the last activity of chat threads, mark existing chats read for their members and turn chats archived before 2.44 into per-member archives',
})
export class BackfillAgentChatThreadInboxStateCommand extends ProvisionedWorkspaceCommandRunner {
  constructor(
    protected readonly workspaceIteratorService: WorkspaceIteratorService,
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly storage: AgentHistoryUpgradeStorageService,
  ) {
    super(workspaceIteratorService);
  }

  override async runOnWorkspace(args: RunOnWorkspaceArgs): Promise<void> {
    await this.up(args);
  }

  async up({ workspaceId, options }: RunOnWorkspaceArgs): Promise<void> {
    const threadObjectMetadataId =
      await this.findThreadObjectMetadataIdIfProvisioned(workspaceId);

    if (!isDefined(threadObjectMetadataId)) {
      return;
    }

    if (options.dryRun ?? false) {
      this.logger.log(
        `[DRY RUN] Would backfill chat thread inbox state for workspace ${workspaceId}`,
      );

      return;
    }

    const { threadCount, participantCount, archivedThreadCount } =
      await this.storage.run(workspaceId, ({ manager }) =>
        backfillAgentChatThreadInboxState({
          manager,
          workspaceId,
          threadObjectMetadataId,
        }),
      );

    this.logger.log(
      `Workspace ${workspaceId}: backfilled last activity on ${threadCount} chat(s), created ${participantCount} participant(s), restored ${archivedThreadCount} chat(s) to their members' archive`,
    );
  }

  async down({ workspaceId, options }: RunOnWorkspaceArgs): Promise<void> {
    const threadObjectMetadataId =
      await this.findThreadObjectMetadataIdIfProvisioned(workspaceId);

    if (!isDefined(threadObjectMetadataId)) {
      return;
    }

    if (options.dryRun ?? false) {
      this.logger.log(
        `[DRY RUN] Would move archived chats back to the trash for workspace ${workspaceId}`,
      );

      return;
    }

    const movedCount = await this.storage.run(workspaceId, ({ manager }) =>
      moveRestoredArchivedChatThreadsBackToTrash({ manager, workspaceId }),
    );

    this.logger.log(
      `Workspace ${workspaceId}: moved ${movedCount} archived chat(s) back to the trash`,
    );
  }

  private async findThreadObjectMetadataIdIfProvisioned(
    workspaceId: string,
  ): Promise<string | undefined> {
    const { flatObjectMetadataMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatObjectMetadataMaps',
      ]);

    const threadObject =
      flatObjectMetadataMaps.byUniversalIdentifier[
        STANDARD_OBJECTS.agentChatThread.universalIdentifier
      ];
    const participantObject =
      flatObjectMetadataMaps.byUniversalIdentifier[
        STANDARD_OBJECTS.agentChatThreadParticipant.universalIdentifier
      ];

    if (!isDefined(threadObject) || !isDefined(participantObject)) {
      this.logger.log(
        `Chat thread objects not found for workspace ${workspaceId}, skipping`,
      );

      return undefined;
    }

    return threadObject.id;
  }
}
