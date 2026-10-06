import { isNonEmptyArray, isNonEmptyString } from '@sniptt/guards';

import { type TeamsActivitiesDispatchPayload } from 'src/features/chat/logic-functions/types/teams-activities-dispatch-payload.type';
import { type TeamsAssistantRequestDraft } from 'src/features/chat/logic-functions/types/teams-assistant-request-draft.type';
import { collectTeamsBotMentionTexts } from 'src/features/chat/logic-functions/utils/collect-teams-bot-mention-texts';
import { normalizeTeamsRequestText } from 'src/features/chat/logic-functions/utils/normalize-teams-request-text';

const BOT_ACCOUNT_ID_PREFIX = '28:';

const PERSONAL_CONVERSATION_TYPE = 'personal';

type ParsedTeamsAssistantRequest =
  | { request: TeamsAssistantRequestDraft }
  | { request: null; skipReason: string };

export const parseTeamsAssistantRequest = ({
  activity,
  serviceUrl,
  tenantId,
}: TeamsActivitiesDispatchPayload): ParsedTeamsAssistantRequest => {
  if (activity.type !== 'message') {
    return {
      request: null,
      skipReason: `Unhandled activity type: ${activity.type}`,
    };
  }

  const senderId = activity.from?.id;

  if (
    activity.from?.role === 'bot' ||
    senderId?.startsWith(BOT_ACCOUNT_ID_PREFIX) === true
  ) {
    return { request: null, skipReason: 'Not a user message' };
  }

  const conversationId = activity.conversation?.id;

  if (
    !isNonEmptyString(activity.id) ||
    !isNonEmptyString(conversationId) ||
    !isNonEmptyString(senderId)
  ) {
    return { request: null, skipReason: 'Activity is missing required fields' };
  }

  const conversationType =
    activity.conversation?.conversationType ?? PERSONAL_CONVERSATION_TYPE;

  if (
    conversationType !== PERSONAL_CONVERSATION_TYPE &&
    !isNonEmptyArray(collectTeamsBotMentionTexts(activity))
  ) {
    return { request: null, skipReason: 'Bot is not mentioned' };
  }

  const requestText = normalizeTeamsRequestText(activity);

  if (!isNonEmptyString(requestText)) {
    return { request: null, skipReason: 'Empty request text' };
  }

  return {
    request: {
      teamsActivityId: activity.id,
      teamsConversationId: conversationId,
      teamsConversationType: conversationType,
      teamsServiceUrl: serviceUrl,
      teamsTenantId: tenantId,
      teamsUserId: senderId,
      teamsUserAadObjectId: activity.from?.aadObjectId ?? '',
      requestText,
    },
  };
};
