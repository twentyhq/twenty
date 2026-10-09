import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';
import { escapeIdentifier } from 'src/engine/workspace-manager/workspace-migration/utils/remove-sql-injection.util';

const LAST_MESSAGE_TEXT_MAX_LENGTH = 280;

// Sets the inbox activity of the threads buildThreadIdsSql selects (as "id") from
// their messages. A user message without a sender predates multiplayer chats,
// when every user message was the owner's
export const buildAgentChatThreadActivityUpdateQuery = ({
  workspaceId,
  buildThreadIdsSql,
}: {
  workspaceId: string;
  buildThreadIdsSql: (tables: { thread: string; message: string }) => string;
}): string => {
  const schema = escapeIdentifier(getWorkspaceSchemaName(workspaceId));
  const tables = {
    thread: `${schema}."agentChatThread"`,
    message: `${schema}."agentMessage"`,
    messagePart: `${schema}."agentMessagePart"`,
  };

  return `WITH selected AS (
       ${buildThreadIdsSql(tables)}
     ), activity AS (
       SELECT thread.id,
         COALESCE(last_message."createdAt", thread."createdAt") AS "lastActivityAt",
         left(last_text."textContent", ${LAST_MESSAGE_TEXT_MAX_LENGTH}) AS "lastMessageText",
         last_message."senderWorkspaceMemberId",
         writer."workspaceMemberIds"
       FROM ${tables.thread} thread
       LEFT JOIN LATERAL (
         SELECT message.id, message."createdAt",
           CASE WHEN message.role = 'user'
             THEN COALESCE(message."senderWorkspaceMemberId", thread."workspaceMemberId")
           END AS "senderWorkspaceMemberId"
         FROM ${tables.message} message
         WHERE message."threadId" = thread.id
           AND message."deletedAt" IS NULL
           AND message."isHidden" = false
           AND message.role IN ('user', 'assistant')
         ORDER BY message."createdAt" DESC, message.id DESC
         LIMIT 1
       ) last_message ON true
       LEFT JOIN LATERAL (
         SELECT part."textContent"
         FROM ${tables.messagePart} part
         WHERE part."messageId" = last_message.id
           AND part.type = 'text'
           AND btrim(coalesce(part."textContent", '')) <> ''
         ORDER BY part."orderIndex" DESC
         LIMIT 1
       ) last_text ON true
       LEFT JOIN LATERAL (
         SELECT array_agg(DISTINCT COALESCE(message."senderWorkspaceMemberId", thread."workspaceMemberId")::text)
           FILTER (WHERE COALESCE(message."senderWorkspaceMemberId", thread."workspaceMemberId") IS NOT NULL)
           AS "workspaceMemberIds"
         FROM ${tables.message} message
         WHERE message."threadId" = thread.id
           AND message."deletedAt" IS NULL
           AND message."isHidden" = false
           AND message.role = 'user'
       ) writer ON true
       WHERE thread.id IN (SELECT id FROM selected)
     )
     UPDATE ${tables.thread} thread
     SET "lastActivityAt" = activity."lastActivityAt",
       "lastMessageText" = activity."lastMessageText",
       "lastMessageSenderWorkspaceMemberId" = activity."senderWorkspaceMemberId",
       "writerWorkspaceMemberIds" = activity."workspaceMemberIds"
     FROM activity
     WHERE thread.id = activity.id`;
};
