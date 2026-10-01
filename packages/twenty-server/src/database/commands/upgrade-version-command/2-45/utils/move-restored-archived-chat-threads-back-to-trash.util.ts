import { type EntityManager } from 'typeorm';

import { buildAgentChatThreadsMoveRecordedAtSql } from 'src/database/commands/upgrade-version-command/2-45/utils/build-agent-chat-threads-move-recorded-at-sql.util';
import { getAgentChatThreadInboxBackfillTables } from 'src/database/commands/upgrade-version-command/2-45/utils/get-agent-chat-thread-inbox-backfill-tables.util';
import { MOVE_AGENT_CHAT_THREADS_TO_RECORD_MODEL_UPGRADE_MIGRATION_NAME } from 'src/database/commands/upgrade-version-command/2-45/utils/move-agent-chat-threads-to-record-model-upgrade-migration-name.constant';

// Only chats whose owner still holds them archived go back to the trash, so a
// chat restored by hand after 2.44 stays where its owner put it. They go back
// at the time the 2.44 move was recorded, so running up again finds them, and
// a workspace without that record had nothing restored by up
export const moveRestoredArchivedChatThreadsBackToTrash = async ({
  manager,
  workspaceId,
}: {
  manager: EntityManager;
  workspaceId: string;
}): Promise<number> => {
  const tables = getAgentChatThreadInboxBackfillTables(workspaceId);

  const threads = await manager.query<{ id: string }[]>(
    `WITH move AS (
       SELECT (${buildAgentChatThreadsMoveRecordedAtSql({
         workspaceIdParameter: '$1',
         migrationNameParameter: '$2',
       })}) AS "recordedAt"
     ), moved AS (
       UPDATE ${tables.thread} thread
       SET "deletedAt" = move."recordedAt"
       FROM move, ${tables.participant} participant
       WHERE move."recordedAt" IS NOT NULL
         AND participant."threadId" = thread.id
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
