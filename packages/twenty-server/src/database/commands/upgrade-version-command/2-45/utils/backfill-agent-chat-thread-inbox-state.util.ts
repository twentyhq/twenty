import { type EntityManager } from 'typeorm';

import { MOVE_AGENT_CHAT_THREADS_TO_RECORD_MODEL_UPGRADE_MIGRATION_NAME } from 'src/database/commands/upgrade-version-command/2-45/utils/move-agent-chat-threads-to-record-model-upgrade-migration-name.constant';
import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';
import { escapeIdentifier } from 'src/engine/workspace-manager/workspace-migration/utils/remove-sql-injection.util';

type BackfillCounts = {
  threadCount: number;
  participantCount: number;
  archivedThreadCount: number;
};

const getTables = (workspaceId: string) => {
  const schema = escapeIdentifier(getWorkspaceSchemaName(workspaceId));

  return {
    thread: `${schema}."agentChatThread"`,
    message: `${schema}."agentMessage"`,
    participant: `${schema}."agentChatThreadParticipant"`,
    recordShare: `${schema}."recordShare"`,
    workspaceMember: `${schema}."workspaceMember"`,
  };
};

// Every member who could read a thread before this upgrade starts with it
// read, so the upgrade itself does not light up every existing conversation.
// Chats 2.44 moved from archived to the trash become archived for their owner
// again. They keep archivedAt, and were trashed no later than that move was
// recorded, which tells them apart from chats a member restored and deleted
// again since.
export const backfillAgentChatThreadInboxState = async ({
  manager,
  workspaceId,
  threadObjectMetadataId,
}: {
  manager: EntityManager;
  workspaceId: string;
  threadObjectMetadataId: string;
}): Promise<BackfillCounts> => {
  const tables = getTables(workspaceId);

  const threads = await manager.query<{ id: string }[]>(
    `WITH updated AS (
     UPDATE ${tables.thread} thread
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
     WHERE thread."lastActivityAt" IS NULL
     RETURNING thread.id
     )
     SELECT id FROM updated`,
  );

  const participants = await manager.query<{ threadId: string }[]>(
    `INSERT INTO ${tables.participant} ("threadId", "workspaceMemberId", "lastReadAt")
     SELECT thread.id, reader."workspaceMemberId", thread."lastActivityAt"
     FROM (
       SELECT thread.id AS "threadId", thread."workspaceMemberId"
       FROM ${tables.thread} thread
       WHERE thread."workspaceMemberId" IS NOT NULL
       UNION
       SELECT share."recordId", share."principalId"
       FROM ${tables.recordShare} share
       WHERE share."objectMetadataId" = $1
         AND share."principalType" = 'WORKSPACE_MEMBER'
         AND share."deletedAt" IS NULL
     ) reader
     JOIN ${tables.thread} thread ON thread.id = reader."threadId"
     JOIN ${tables.workspaceMember} member
       ON member.id = reader."workspaceMemberId" AND member."deletedAt" IS NULL
     ON CONFLICT ("threadId", "workspaceMemberId") DO NOTHING
     RETURNING "threadId"`,
    [threadObjectMetadataId],
  );

  // An archive older than the thread's last message would show the chat as
  // back in the inbox, which is not where its owner left it
  const archivedThreads = await manager.query<{ threadId: string }[]>(
    `WITH restored AS (
       UPDATE ${tables.thread} thread
       SET "deletedAt" = NULL
       WHERE thread."archivedAt" IS NOT NULL
         AND thread."deletedAt" IS NOT NULL
         AND thread."workspaceMemberId" IS NOT NULL
         AND thread."deletedAt" <= (
           SELECT min(migration."createdAt")
           FROM core."upgradeMigration" migration
           WHERE migration."workspaceId" = $1
             AND migration.name = $2
             AND migration.status = 'completed'
         )
       RETURNING thread.id, thread."workspaceMemberId", thread."archivedAt", thread."lastActivityAt"
     )
     INSERT INTO ${tables.participant} AS participant ("threadId", "workspaceMemberId", "lastReadAt", "archivedAt")
     SELECT restored.id, restored."workspaceMemberId", restored."lastActivityAt",
       GREATEST(restored."archivedAt", restored."lastActivityAt")
     FROM restored
     JOIN ${tables.workspaceMember} member
       ON member.id = restored."workspaceMemberId" AND member."deletedAt" IS NULL
     ON CONFLICT ("threadId", "workspaceMemberId") DO UPDATE SET
       "archivedAt" = EXCLUDED."archivedAt"
     RETURNING participant."threadId"`,
    [
      workspaceId,
      MOVE_AGENT_CHAT_THREADS_TO_RECORD_MODEL_UPGRADE_MIGRATION_NAME,
    ],
  );

  return {
    threadCount: threads.length,
    participantCount: participants.length,
    archivedThreadCount: archivedThreads.length,
  };
};

// Only chats whose owner still holds them archived go back to the trash, so a
// chat restored by hand after 2.44 stays where its owner put it. They go back
// at the time the 2.44 move was recorded, so running up again finds them
export const moveRestoredArchivedChatThreadsBackToTrash = async ({
  manager,
  workspaceId,
}: {
  manager: EntityManager;
  workspaceId: string;
}): Promise<number> => {
  const tables = getTables(workspaceId);

  const threads = await manager.query<{ id: string }[]>(
    `WITH moved AS (
     UPDATE ${tables.thread} thread
     SET "deletedAt" = COALESCE(
       (
         SELECT min(migration."createdAt")
         FROM core."upgradeMigration" migration
         WHERE migration."workspaceId" = $1
           AND migration.name = $2
           AND migration.status = 'completed'
       ),
       now()
     )
     FROM ${tables.participant} participant
     WHERE participant."threadId" = thread.id
       AND participant."workspaceMemberId" = thread."workspaceMemberId"
       AND participant."archivedAt" IS NOT NULL
       AND thread."archivedAt" IS NOT NULL
       AND thread."deletedAt" IS NULL
     RETURNING thread.id
     )
     SELECT id FROM moved`,
    [
      workspaceId,
      MOVE_AGENT_CHAT_THREADS_TO_RECORD_MODEL_UPGRADE_MIGRATION_NAME,
    ],
  );

  return threads.length;
};
