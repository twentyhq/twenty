import { type EntityManager } from 'typeorm';

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
// again: they keep archivedAt, which tells them apart from deleted chats.
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
     WHERE thread."lastActivityAt" IS NULL
     RETURNING thread.id`,
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
  );

  return {
    threadCount: threads.length,
    participantCount: participants.length,
    archivedThreadCount: archivedThreads.length,
  };
};

// Only chats whose owner still holds them archived go back to the trash, so a
// chat restored by hand after 2.44 stays where its owner put it
export const moveRestoredArchivedChatThreadsBackToTrash = async ({
  manager,
  workspaceId,
}: {
  manager: EntityManager;
  workspaceId: string;
}): Promise<number> => {
  const tables = getTables(workspaceId);

  const threads = await manager.query<{ id: string }[]>(
    `UPDATE ${tables.thread} thread
     SET "deletedAt" = now()
     FROM ${tables.participant} participant
     WHERE participant."threadId" = thread.id
       AND participant."workspaceMemberId" = thread."workspaceMemberId"
       AND participant."archivedAt" IS NOT NULL
       AND thread."archivedAt" IS NOT NULL
       AND thread."deletedAt" IS NULL
     RETURNING thread.id`,
  );

  return threads.length;
};
