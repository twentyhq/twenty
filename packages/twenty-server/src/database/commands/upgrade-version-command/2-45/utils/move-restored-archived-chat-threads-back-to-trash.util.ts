import { type EntityManager } from 'typeorm';

import { getAgentChatThreadInboxBackfillTables } from 'src/database/commands/upgrade-version-command/2-45/utils/get-agent-chat-thread-inbox-backfill-tables.util';
import { MOVE_AGENT_CHAT_THREADS_TO_RECORD_MODEL_UPGRADE_MIGRATION_NAME } from 'src/database/commands/upgrade-version-command/2-45/utils/move-agent-chat-threads-to-record-model-upgrade-migration-name.constant';

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
  const tables = getAgentChatThreadInboxBackfillTables(workspaceId);

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
