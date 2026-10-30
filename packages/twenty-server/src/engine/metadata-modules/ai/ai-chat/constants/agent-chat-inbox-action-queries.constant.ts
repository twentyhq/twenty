import { AGENT_CHAT_THREAD_PARTICIPANT_ALL_MENTIONS_RESOLVED_AT } from 'src/engine/metadata-modules/ai/ai-chat/constants/agent-chat-thread-participant-all-mentions-resolved-at.constant';
import { AGENT_CHAT_THREAD_PARTICIPANT_NEXT_UPDATED_AT } from 'src/engine/metadata-modules/ai/ai-chat/constants/agent-chat-thread-participant-next-updated-at.constant';
import { AgentChatInboxAction } from 'src/engine/metadata-modules/ai/ai-chat/enums/agent-chat-inbox-action.enum';
import { type BuildAgentChatThreadParticipantWriteQuery } from 'src/engine/metadata-modules/ai/ai-chat/types/build-agent-chat-thread-participant-write-query.type';

// Saved as ended when already due, since its queued end may have run before this write
const buildSnoozeQuery: BuildAgentChatThreadParticipantWriteQuery = ({
  participantTable,
}) =>
  `INSERT INTO ${participantTable} AS participant ("threadId", "workspaceMemberId", "archivedAt", "snoozedUntil", "isSubscribed")
   VALUES ($1, $2, CASE WHEN $3::timestamptz <= clock_timestamp() THEN NULL ELSE clock_timestamp() END, $3, true)
   ON CONFLICT ("threadId", "workspaceMemberId") DO UPDATE SET
     "archivedAt" = EXCLUDED."archivedAt",
     "snoozedUntil" = EXCLUDED."snoozedUntil",
     "isSubscribed" = true,
     "updatedAt" = ${AGENT_CHAT_THREAD_PARTICIPANT_NEXT_UPDATED_AT}
   RETURNING *`;

// Mirrored by applyAgentChatInboxAction for the optimistic copy
export const AGENT_CHAT_INBOX_ACTION_QUERIES: Record<
  AgentChatInboxAction,
  BuildAgentChatThreadParticipantWriteQuery
> = {
  // Read up to what the thread holds now, never past it, and never back.
  // Reading or marking unread tracks a chat without following it
  [AgentChatInboxAction.READ]: ({ participantTable, threadTable }) =>
    `INSERT INTO ${participantTable} AS participant ("threadId", "workspaceMemberId", "lastReadAt", "isSubscribed")
     SELECT thread.id, $2, thread."lastActivityAt", false FROM ${threadTable} thread WHERE thread.id = $1
     ON CONFLICT ("threadId", "workspaceMemberId") DO UPDATE SET
       "lastReadAt" = GREATEST(participant."lastReadAt", EXCLUDED."lastReadAt"),
       "mentionsResolvedAt" = ${AGENT_CHAT_THREAD_PARTICIPANT_ALL_MENTIONS_RESOLVED_AT},
       "updatedAt" = ${AGENT_CHAT_THREAD_PARTICIPANT_NEXT_UPDATED_AT}
     RETURNING *`,
  [AgentChatInboxAction.UNREAD]: ({ participantTable }) =>
    `INSERT INTO ${participantTable} AS participant ("threadId", "workspaceMemberId", "lastReadAt", "isSubscribed")
     VALUES ($1, $2, NULL, false)
     ON CONFLICT ("threadId", "workspaceMemberId") DO UPDATE SET
       "lastReadAt" = NULL,
       "updatedAt" = ${AGENT_CHAT_THREAD_PARTICIPANT_NEXT_UPDATED_AT}
     RETURNING *`,
  [AgentChatInboxAction.ARCHIVE]: ({ participantTable }) =>
    `INSERT INTO ${participantTable} AS participant ("threadId", "workspaceMemberId", "archivedAt", "isSubscribed")
     VALUES ($1, $2, clock_timestamp(), true)
     ON CONFLICT ("threadId", "workspaceMemberId") DO UPDATE SET
       "archivedAt" = EXCLUDED."archivedAt",
       "snoozedUntil" = NULL,
       "isSubscribed" = true,
       "mentionsResolvedAt" = ${AGENT_CHAT_THREAD_PARTICIPANT_ALL_MENTIONS_RESOLVED_AT},
       "updatedAt" = ${AGENT_CHAT_THREAD_PARTICIPANT_NEXT_UPDATED_AT}
     RETURNING *`,
  [AgentChatInboxAction.SNOOZE]: buildSnoozeQuery,
  [AgentChatInboxAction.MOVE_TO_INBOX]: ({ participantTable }) =>
    `INSERT INTO ${participantTable} AS participant ("threadId", "workspaceMemberId")
     VALUES ($1, $2)
     ON CONFLICT ("threadId", "workspaceMemberId") DO UPDATE SET
       "archivedAt" = NULL,
       "snoozedUntil" = NULL,
       "isSubscribed" = true,
       "updatedAt" = ${AGENT_CHAT_THREAD_PARTICIPANT_NEXT_UPDATED_AT}
     RETURNING *`,
  [AgentChatInboxAction.SUBSCRIBE]: ({ participantTable }) =>
    `INSERT INTO ${participantTable} AS participant ("threadId", "workspaceMemberId")
     VALUES ($1, $2)
     ON CONFLICT ("threadId", "workspaceMemberId") DO UPDATE SET
       "isSubscribed" = true,
       "updatedAt" = ${AGENT_CHAT_THREAD_PARTICIPANT_NEXT_UPDATED_AT}
     RETURNING *`,
  // Files the chat under done and keeps it there whatever happens in it,
  // until the member is mentioned or writes in it again
  [AgentChatInboxAction.UNSUBSCRIBE]: ({ participantTable }) =>
    `INSERT INTO ${participantTable} AS participant ("threadId", "workspaceMemberId", "isSubscribed", "archivedAt")
     VALUES ($1, $2, false, clock_timestamp())
     ON CONFLICT ("threadId", "workspaceMemberId") DO UPDATE SET
       "isSubscribed" = false,
       "archivedAt" = EXCLUDED."archivedAt",
       "snoozedUntil" = NULL,
       "mentionsResolvedAt" = ${AGENT_CHAT_THREAD_PARTICIPANT_ALL_MENTIONS_RESOLVED_AT},
       "updatedAt" = ${AGENT_CHAT_THREAD_PARTICIPANT_NEXT_UPDATED_AT}
     RETURNING *`,
};
