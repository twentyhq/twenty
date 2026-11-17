import { kv } from 'twenty-sdk/logic-function';

import { TEAMS_ASSISTANT_EMPTY_REQUEST_TEXT } from 'src/features/chat/logic-functions/constants/teams-assistant-empty-request-text';
import { type TeamsActivitiesEnqueueResult } from 'src/features/chat/logic-functions/types/teams-activities-enqueue-result.type';
import { type TeamsAssistantEmptyRequest } from 'src/features/chat/logic-functions/types/teams-assistant-empty-request.type';
import { buildTeamsEmptyRequestReplyKvKey } from 'src/features/chat/logic-functions/utils/build-teams-empty-request-reply-kv-key';
import { claimTeamsEmptyRequestReply } from 'src/features/chat/logic-functions/utils/claim-teams-empty-request-reply';
import { getTeamsConnectorAccessTokenOrThrow } from 'src/features/chat/logic-functions/utils/get-teams-connector-access-token-or-throw';
import { sendTeamsActivity } from 'src/features/chat/logic-functions/utils/send-teams-activity';

export const replyToEmptyTeamsAssistantRequest = async (
  emptyRequest: TeamsAssistantEmptyRequest,
): Promise<TeamsActivitiesEnqueueResult> => {
  if (!(await claimTeamsEmptyRequestReply(emptyRequest))) {
    return { ok: true, skipped: 'Empty request was already answered' };
  }

  try {
    await sendTeamsActivity({
      serviceUrl: emptyRequest.teamsServiceUrl,
      conversationId: emptyRequest.teamsConversationId,
      accessToken: await getTeamsConnectorAccessTokenOrThrow(),
      activity: { type: 'message', text: TEAMS_ASSISTANT_EMPTY_REQUEST_TEXT },
    });
  } catch (error) {
    await kv
      .delete(buildTeamsEmptyRequestReplyKvKey(emptyRequest))
      .catch((releaseError: unknown) =>
        console.warn(
          `[teams] could not release the hint claim of ${emptyRequest.teamsActivityId}`,
          releaseError,
        ),
      );

    throw error;
  }

  return { ok: true };
};
