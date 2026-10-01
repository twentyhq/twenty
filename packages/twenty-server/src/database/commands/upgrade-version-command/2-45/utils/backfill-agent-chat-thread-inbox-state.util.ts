import { type EntityManager } from 'typeorm';

import { buildAgentChatThreadReadersSql } from 'src/database/commands/upgrade-version-command/2-45/utils/build-agent-chat-thread-readers-sql.util';
import { buildAgentChatThreadsMoveRecordedAtSql } from 'src/database/commands/upgrade-version-command/2-45/utils/build-agent-chat-threads-move-recorded-at-sql.util';
import { getAgentChatThreadInboxBackfillTables } from 'src/database/commands/upgrade-version-command/2-45/utils/get-agent-chat-thread-inbox-backfill-tables.util';
import { MOVE_AGENT_CHAT_THREADS_TO_RECORD_MODEL_UPGRADE_MIGRATION_NAME } from 'src/database/commands/upgrade-version-command/2-45/utils/move-agent-chat-threads-to-record-model-upgrade-migration-name.constant';

type BackfillCounts = {
  threadCount: number;
  participantCount: number;
  archivedThreadCount: number;
};

// Every member who could read a thread before this upgrade starts with it
// read, so the upgrade itself does not light up every existing conversation.
// Chats 2.44 moved from archived to the trash become archived again. They
// keep archivedAt, and were trashed no later than that move was recorded,
// which tells them apart from chats a member restored and deleted again since.
export const backfillAgentChatThreadInboxState = async ({
  manager,
  workspaceId,
  threadObjectMetadataId,
}: {
  manager: EntityManager;
  workspaceId: string;
  threadObjectMetadataId: string;
}): Promise<BackfillCounts> => {
  const tables = getAgentChatThreadInboxBackfillTables(workspaceId);

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
     FROM (${buildAgentChatThreadReadersSql({
       tables,
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
         AND thread."deletedAt" <= (${buildAgentChatThreadsMoveRecordedAtSql({
           workspaceIdParameter: '$1',
           migrationNameParameter: '$2',
         })})
       RETURNING thread.id, thread."workspaceMemberId", thread."archivedAt", thread."lastActivityAt"
     ),
     reader AS (${buildAgentChatThreadReadersSql({
       tables,
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
    threadCount: threads.length,
    participantCount: participants.length,
    archivedThreadCount: new Set(archivedThreads.map(({ threadId }) => threadId))
      .size,
  };
};
