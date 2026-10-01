import { Command } from 'nest-commander';
import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { isDefined } from 'twenty-shared/utils';
import { type EntityManager } from 'typeorm';

import { AgentHistoryUpgradeStorageService } from 'src/database/commands/agent-history/agent-history-upgrade-storage.service';
import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';
import { escapeIdentifier } from 'src/engine/workspace-manager/workspace-migration/utils/remove-sql-injection.util';

// The 2.44 command that moved archived chats to the trash, as the upgrade
// runner records it once it completes for a workspace
const MOVE_AGENT_CHAT_THREADS_TO_RECORD_MODEL_UPGRADE_MIGRATION_NAME =
  '2.44.0_MoveAgentChatThreadsToRecordModelCommand_1790751626421';

// When 2.44 moved archived chats to the trash, or NULL if it never ran here
const AGENT_CHAT_THREADS_MOVE_RECORDED_AT_SQL = `
  SELECT min(migration."createdAt")
  FROM core."upgradeMigration" migration
  WHERE migration."workspaceId" = $1
    AND migration.name = $2
    AND migration.status = 'completed'`;

const getBackfillTables = (workspaceId: string) => {
  const schema = escapeIdentifier(getWorkspaceSchemaName(workspaceId));

  return {
    thread: `${schema}."agentChatThread"`,
    message: `${schema}."agentMessage"`,
    participant: `${schema}."agentChatThreadParticipant"`,
    recordShare: `${schema}."recordShare"`,
    workspaceMember: `${schema}."workspaceMember"`,
  };
};

// The owner and every member the thread is shared with, before this upgrade
const buildThreadReadersSql = ({
  recordShareTable,
  threadSource,
  objectMetadataIdParameter,
}: {
  recordShareTable: string;
  threadSource: string;
  objectMetadataIdParameter: string;
}) => `
  SELECT thread.id AS "threadId", thread."workspaceMemberId"
  FROM ${threadSource} thread
  WHERE thread."workspaceMemberId" IS NOT NULL
  UNION
  SELECT share."recordId", share."principalId"
  FROM ${recordShareTable} share
  JOIN ${threadSource} thread ON thread.id = share."recordId"
  WHERE share."objectMetadataId" = ${objectMetadataIdParameter}
    AND share."principalType" = 'WORKSPACE_MEMBER'
    AND share."deletedAt" IS NULL`;

// Every member who could read a thread before this upgrade starts with it
// read, so the upgrade itself does not light up every existing conversation.
// Chats 2.44 moved from archived to the trash become archived again. They
// keep archivedAt, and were trashed no later than that move was recorded,
// which tells them apart from chats a member restored and deleted again since.
const backfillAgentChatThreadInboxState = async ({
  manager,
  workspaceId,
  threadObjectMetadataId,
}: {
  manager: EntityManager;
  workspaceId: string;
  threadObjectMetadataId: string;
}) => {
  const tables = getBackfillTables(workspaceId);

  const [, threadCount]: [unknown[], number] = await manager.query(
    `UPDATE ${tables.thread} thread
     SET "lastActivityAt" = COALESCE(
       (
         SELECT max(message."createdAt")
         FROM ${tables.message} message
         WHERE message."threadId" = thread.id
           AND message."deletedAt" IS NULL
           AND message."isHidden" = false
           AND message.role IN ('user', 'assistant')
       ),
       thread."createdAt"
     )
     WHERE thread."lastActivityAt" IS NULL`,
  );

  const participants = await manager.query<{ threadId: string }[]>(
    `INSERT INTO ${tables.participant} ("threadId", "workspaceMemberId", "lastReadAt")
     SELECT thread.id, reader."workspaceMemberId", thread."lastActivityAt"
     FROM (${buildThreadReadersSql({
       recordShareTable: tables.recordShare,
       threadSource: tables.thread,
       objectMetadataIdParameter: '$1',
     })}
     ) reader
     JOIN ${tables.thread} thread ON thread.id = reader."threadId"
     JOIN ${tables.workspaceMember} member
       ON member.id = reader."workspaceMemberId" AND member."deletedAt" IS NULL
     ON CONFLICT ("threadId", "workspaceMemberId") DO NOTHING
     RETURNING "threadId"`,
    [threadObjectMetadataId],
  );

  // An archive older than the thread's last message would show the chat as
  // back in the inbox, which is not where it was left. Archive was shared by
  // everyone who could read the chat, so each of them gets it back archived
  const archivedThreads = await manager.query<{ threadId: string }[]>(
    `WITH restored AS (
       UPDATE ${tables.thread} thread
       SET "deletedAt" = NULL
       WHERE thread."archivedAt" IS NOT NULL
         AND thread."deletedAt" IS NOT NULL
         AND thread."workspaceMemberId" IS NOT NULL
         AND thread."deletedAt" <= (${AGENT_CHAT_THREADS_MOVE_RECORDED_AT_SQL})
       RETURNING thread.id, thread."workspaceMemberId", thread."archivedAt", thread."lastActivityAt"
     ),
     reader AS (${buildThreadReadersSql({
       recordShareTable: tables.recordShare,
       threadSource: 'restored',
       objectMetadataIdParameter: '$3',
     })}
     )
     INSERT INTO ${tables.participant} AS participant ("threadId", "workspaceMemberId", "lastReadAt", "archivedAt")
     SELECT restored.id, reader."workspaceMemberId", restored."lastActivityAt",
       GREATEST(restored."archivedAt", restored."lastActivityAt")
     FROM reader
     JOIN restored ON restored.id = reader."threadId"
     JOIN ${tables.workspaceMember} member
       ON member.id = reader."workspaceMemberId" AND member."deletedAt" IS NULL
     ON CONFLICT ("threadId", "workspaceMemberId") DO UPDATE SET
       "archivedAt" = EXCLUDED."archivedAt"
     RETURNING participant."threadId"`,
    [
      workspaceId,
      MOVE_AGENT_CHAT_THREADS_TO_RECORD_MODEL_UPGRADE_MIGRATION_NAME,
      threadObjectMetadataId,
    ],
  );

  return {
    threadCount,
    participantCount: participants.length,
    archivedThreadCount: new Set(archivedThreads.map(({ threadId }) => threadId))
      .size,
  };
};

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

@RegisteredWorkspaceCommand('2.45.0', 1790884925594)
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
