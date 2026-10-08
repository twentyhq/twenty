import { Command } from 'nest-commander';
import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { isDefined } from 'twenty-shared/utils';
import { type EntityManager } from 'typeorm';

import { AgentHistoryUpgradeStorageService } from 'src/database/commands/agent-history/agent-history-upgrade-storage.service';
import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import {
  AGENT_CHAT_THREADS_MOVE_RECORDED_AT_SQL,
  MOVE_AGENT_CHAT_THREADS_TO_RECORD_MODEL_UPGRADE_MIGRATION_NAME,
  backfillAgentChatThreadInboxState,
  getBackfillTables,
} from 'src/database/commands/upgrade-version-command/2-46/utils/backfill-agent-chat-thread-inbox-state.util';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

// Only chats whose owner still holds them archived go back to the trash, so a
// chat restored by hand after 2.44 stays where its owner put it. They go back
// at the time the 2.44 move was recorded, so running up again finds them, and
// a workspace without that record had nothing restored by up
const moveRestoredArchivedChatThreadsBackToTrash = async ({
  manager,
  workspaceId,
}: {
  manager: EntityManager;
  workspaceId: string;
}): Promise<number> => {
  const tables = getBackfillTables(workspaceId);

  const [, movedCount]: [unknown[], number] = await manager.query(
    `WITH move AS (
       SELECT (${AGENT_CHAT_THREADS_MOVE_RECORDED_AT_SQL}) AS "recordedAt"
     )
     UPDATE ${tables.thread} thread
     SET "deletedAt" = move."recordedAt"
     FROM move, ${tables.participant} participant
     WHERE move."recordedAt" IS NOT NULL
       AND participant."threadId" = thread.id
       AND participant."workspaceMemberId" = thread."workspaceMemberId"
       AND participant."archivedAt" IS NOT NULL
       AND thread."archivedAt" IS NOT NULL
       AND thread."deletedAt" IS NULL`,
    [
      workspaceId,
      MOVE_AGENT_CHAT_THREADS_TO_RECORD_MODEL_UPGRADE_MIGRATION_NAME,
    ],
  );

  return movedCount;
};

const deleteParticipantOwnerShares = async ({
  manager,
  workspaceId,
  participantObjectMetadataId,
}: {
  manager: EntityManager;
  workspaceId: string;
  participantObjectMetadataId: string;
}): Promise<void> => {
  const tables = getBackfillTables(workspaceId);

  await manager.query(
    `DELETE FROM ${tables.recordShare}
     WHERE "objectMetadataId" = $1 AND "rowCause" = 'OWNER'`,
    [participantObjectMetadataId],
  );
};

@RegisteredWorkspaceCommand('2.46.0', 1790942019632)
@Command({
  name: 'upgrade:2-46:backfill-agent-chat-thread-inbox-state',
  description:
    'Backfill the last activity of chat threads, mark existing chats read for their members, grant each participant row to its member and turn chats archived before 2.44 into per-member archives',
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
    const objectMetadataIds =
      await this.findObjectMetadataIdsIfProvisioned(workspaceId);

    if (!isDefined(objectMetadataIds)) {
      return;
    }

    if (options.dryRun ?? false) {
      this.logger.log(
        `[DRY RUN] Would backfill chat thread inbox state for workspace ${workspaceId}`,
      );

      return;
    }

    const { threadCount, participantCount, archivedThreadCount } =
      await backfillAgentChatThreadInboxState({
        storage: this.storage,
        workspaceId,
        ...objectMetadataIds,
      });

    this.logger.log(
      `Workspace ${workspaceId}: backfilled last activity on ${threadCount} chat(s), created ${participantCount} participant(s), restored ${archivedThreadCount} chat(s) to their members' archive`,
    );
  }

  async down({ workspaceId, options }: RunOnWorkspaceArgs): Promise<void> {
    const objectMetadataIds =
      await this.findObjectMetadataIdsIfProvisioned(workspaceId);

    if (!isDefined(objectMetadataIds)) {
      return;
    }

    if (options.dryRun ?? false) {
      this.logger.log(
        `[DRY RUN] Would move archived chats back to the trash for workspace ${workspaceId}`,
      );

      return;
    }

    const movedCount = await this.storage.run(
      workspaceId,
      async ({ manager }) => {
        await deleteParticipantOwnerShares({
          manager,
          workspaceId,
          participantObjectMetadataId:
            objectMetadataIds.participantObjectMetadataId,
        });

        return moveRestoredArchivedChatThreadsBackToTrash({
          manager,
          workspaceId,
        });
      },
    );

    this.logger.log(
      `Workspace ${workspaceId}: moved ${movedCount} archived chat(s) back to the trash`,
    );
  }

  private async findObjectMetadataIdsIfProvisioned(workspaceId: string): Promise<
    | { threadObjectMetadataId: string; participantObjectMetadataId: string }
    | undefined
  > {
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

    return {
      threadObjectMetadataId: threadObject.id,
      participantObjectMetadataId: participantObject.id,
    };
  }
}
