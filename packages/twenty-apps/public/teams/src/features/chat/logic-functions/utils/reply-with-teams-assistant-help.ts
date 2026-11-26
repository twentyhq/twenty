import { TEAMS_ASSISTANT_HELP_TEXT } from 'src/features/chat/logic-functions/constants/teams-assistant-help-text';
import { TEAMS_ASSISTANT_NOTICE_TTL_MS } from 'src/features/chat/logic-functions/constants/teams-assistant-notice-ttl-ms';
import { type TeamsActivitiesEnqueueResult } from 'src/features/chat/logic-functions/types/teams-activities-enqueue-result.type';
import { type TeamsAssistantEmptyRequest } from 'src/features/chat/logic-functions/types/teams-assistant-empty-request.type';
import { buildTeamsAssistantHelpSuggestedActions } from 'src/features/chat/logic-functions/utils/build-teams-assistant-help-suggested-actions';
import { buildTeamsHelpReplyKvKey } from 'src/features/chat/logic-functions/utils/build-teams-help-reply-kv-key';
import { sendTeamsReplyOnce } from 'src/features/chat/logic-functions/utils/send-teams-reply-once';

export const replyWithTeamsAssistantHelp = async (
  request: TeamsAssistantEmptyRequest,
): Promise<TeamsActivitiesEnqueueResult> => {
  const isSent = await sendTeamsReplyOnce({
    kvKey: buildTeamsHelpReplyKvKey(request),
    ttlMs: TEAMS_ASSISTANT_NOTICE_TTL_MS,
    serviceUrl: request.teamsServiceUrl,
    conversationId: request.teamsConversationId,
    text: TEAMS_ASSISTANT_HELP_TEXT,
    suggestedActions: buildTeamsAssistantHelpSuggestedActions(
      request.teamsConversationType,
    ),
  });

  return isSent
    ? { ok: true }
    : { ok: true, skipped: 'Help was already sent for this activity' };
};
