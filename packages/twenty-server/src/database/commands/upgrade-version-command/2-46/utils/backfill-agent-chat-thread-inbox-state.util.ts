import { type EntityManager } from 'typeorm';

import { type AgentHistoryUpgradeStorageService } from 'src/database/commands/agent-history/agent-history-upgrade-storage.service';
import { buildAgentChatThreadActivityUpdateQuery } from 'src/database/commands/upgrade-version-command/2-46/utils/build-agent-chat-thread-activity-update-query.util';
import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';
import { escapeIdentifier } from 'src/engine/workspace-manager/workspace-migration/utils/remove-sql-injection.util';

// The 2.44 command that moved archived chats to the trash, as the upgrade
// runner records it once it completes for a workspace
export const MOVE_AGENT_CHAT_THREADS_TO_RECORD_MODEL_UPGRADE_MIGRATION_NAME =
  '2.44.0_MoveAgentChatThreadsToRecordModelCommand_1790751626421';

// When 2.44 moved archived chats to the trash, or NULL if it never ran here
export const AGENT_CHAT_THREADS_MOVE_RECORDED_AT_SQL = `
  SELECT min(migration."createdAt")
  FROM core."upgradeMigration" migration
  WHERE migration."workspaceId" = $1
    AND migration.name = $2
    AND migration.status = 'completed'`;

export const getBackfillTables = (workspaceId: string) => {
  const schema = escapeIdentifier(getWorkspaceSchemaName(workspaceId));

  return {
    thread: `${schema}."agentChatThread"`,
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

// Each batch commits on its own so a large workspace does not hold every
// thread row lock, and blocks sends, until the whole backfill is done
const THREAD_ACTIVITY_BATCH_SIZE = 500;

// Runtime leaves the inbox columns alone until its 2.46 fence opens, so a
// thread with no activity yet, or with a message newer than it, is what is
// left to do
const backfillThreadActivityBatch = async ({
  manager,
  workspaceId,
}: {
  manager: EntityManager;
  workspaceId: string;
}): Promise<number> => {
  const [, threadCount]: [unknown[], number] = await manager.query(
    buildAgentChatThreadActivityUpdateQuery({
      workspaceId,
      buildThreadIdsSql: ({ thread, message }) =>
        `SELECT thread.id FROM ${thread} thread
         WHERE thread."lastActivityAt" IS NULL
           OR EXISTS (
             SELECT 1 FROM ${message} message
             WHERE message."threadId" = thread.id
               AND message."deletedAt" IS NULL
               AND message."isHidden" = false
               AND message.role IN ('user', 'assistant')
               AND message."createdAt" > thread."lastActivityAt"
           )
         ORDER BY thread.id
         LIMIT ${THREAD_ACTIVITY_BATCH_SIZE}
         FOR UPDATE OF thread`,
    }),
  );

  return threadCount;
};

// Every member who could read a thread before this upgrade starts with it
// read, so the upgrade itself does not light up every existing conversation.
// Chats 2.44 moved from archived to the trash become archived again. They
// keep archivedAt, and were trashed no later than that move was recorded,
// which tells them apart from chats a member restored and deleted again since.
const backfillAgentChatThreadParticipants = async ({
  manager,
  workspaceId,
  threadObjectMetadataId,
  participantObjectMetadataId,
}: {
  manager: EntityManager;
  workspaceId: string;
  threadObjectMetadataId: string;
  participantObjectMetadataId: string;
}) => {
  const tables = getBackfillTables(workspaceId);

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

  // The participant object is PRIVATE: each row is granted to its member, and
  // only them
  await manager.query(
    `INSERT INTO ${tables.recordShare}
       ("objectMetadataId", "recordId", "principalId", "principalType", "accessLevel", "rowCause", "sourceId")
     SELECT $1, participant.id, participant."workspaceMemberId", 'WORKSPACE_MEMBER', 'FULL', 'OWNER', participant.id
     FROM ${tables.participant} participant
     JOIN ${tables.workspaceMember} member
       ON member.id = participant."workspaceMemberId" AND member."deletedAt" IS NULL
     ON CONFLICT DO NOTHING`,
    [participantObjectMetadataId],
  );

  return {
    participantCount: participants.length,
    archivedThreadCount: new Set(
      archivedThreads.map(({ threadId }) => threadId),
    ).size,
  };
};

// Runs again from the command that opens the runtime fence, for the threads
// written to or created since, so every step only fills what is missing
export const backfillAgentChatThreadInboxState = async ({
  storage,
  workspaceId,
  threadObjectMetadataId,
  participantObjectMetadataId,
}: {
  storage: Pick<AgentHistoryUpgradeStorageService, 'run'>;
  workspaceId: string;
  threadObjectMetadataId: string;
  participantObjectMetadataId: string;
}) => {
  let threadCount = 0;

  for (;;) {
    const batchThreadCount = await storage.run(workspaceId, ({ manager }) =>
      backfillThreadActivityBatch({ manager, workspaceId }),
    );

    threadCount += batchThreadCount;

    if (batchThreadCount < THREAD_ACTIVITY_BATCH_SIZE) {
      break;
    }
  }

  const { participantCount, archivedThreadCount } = await storage.run(
    workspaceId,
    ({ manager }) =>
      backfillAgentChatThreadParticipants({
        manager,
        workspaceId,
        threadObjectMetadataId,
        participantObjectMetadataId,
      }),
  );

  return { threadCount, participantCount, archivedThreadCount };
};
