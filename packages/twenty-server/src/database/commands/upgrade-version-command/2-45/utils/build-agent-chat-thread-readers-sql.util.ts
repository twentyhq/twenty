import { type getAgentChatThreadInboxBackfillTables } from 'src/database/commands/upgrade-version-command/2-45/utils/get-agent-chat-thread-inbox-backfill-tables.util';

// The owner and every member the thread is shared with, before this upgrade
export const buildAgentChatThreadReadersSql = ({
  tables,
  threadSource,
  objectMetadataIdParameter,
}: {
  tables: ReturnType<typeof getAgentChatThreadInboxBackfillTables>;
  threadSource: string;
  objectMetadataIdParameter: string;
}) => `
  SELECT thread.id AS "threadId", thread."workspaceMemberId"
  FROM ${threadSource} thread
  WHERE thread."workspaceMemberId" IS NOT NULL
  UNION
  SELECT share."recordId", share."principalId"
  FROM ${tables.recordShare} share
  JOIN ${threadSource} thread ON thread.id = share."recordId"
  WHERE share."objectMetadataId" = ${objectMetadataIdParameter}
    AND share."principalType" = 'WORKSPACE_MEMBER'
    AND share."deletedAt" IS NULL`;
