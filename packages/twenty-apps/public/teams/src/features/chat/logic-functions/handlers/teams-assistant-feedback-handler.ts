import { isNonEmptyString } from '@sniptt/guards';
import { CoreApiClient } from 'twenty-client-sdk/core';
import { isDefined } from 'twenty-sdk/utils';

import { findTeamsAssistantRequestByAnswerActivity } from 'src/features/chat/logic-functions/data/find-teams-assistant-request-by-answer-activity';
import { updateTeamsAssistantRequest } from 'src/features/chat/logic-functions/data/update-teams-assistant-request';
import { type TeamsActivitiesDispatchPayload } from 'src/features/chat/logic-functions/types/teams-activities-dispatch-payload.type';
import { type TeamsAssistantFeedbackResult } from 'src/features/chat/logic-functions/types/teams-assistant-feedback-result.type';
import { parseTeamsAssistantFeedback } from 'src/features/chat/logic-functions/utils/parse-teams-assistant-feedback';

export const teamsAssistantFeedbackHandler = async ({
  activity,
}: Pick<
  TeamsActivitiesDispatchPayload,
  'activity'
>): Promise<TeamsAssistantFeedbackResult> => {
  const teamsConversationId = activity.conversation?.id;
  const teamsAnswerActivityId = activity.replyToId;
  const teamsUserId = activity.from?.id;

  if (
    !isNonEmptyString(teamsConversationId) ||
    !isNonEmptyString(teamsAnswerActivityId) ||
    !isNonEmptyString(teamsUserId)
  ) {
    return {
      skipped: true,
      reason: 'Feedback has no conversation, answer or sender',
    };
  }

  const feedback = parseTeamsAssistantFeedback(activity);

  if (!isDefined(feedback)) {
    return {
      skipped: true,
      reason: `Unknown feedback reaction: ${activity.value?.actionValue?.reaction}`,
    };
  }

  const client = new CoreApiClient();

  const request = await findTeamsAssistantRequestByAnswerActivity({
    client,
    teamsConversationId,
    teamsAnswerActivityId,
  });

  if (!isDefined(request)) {
    return { skipped: true, reason: 'No request matches the rated answer' };
  }

  if (request.teamsUserId !== teamsUserId) {
    return {
      skipped: true,
      reason: 'Feedback is not from the member who made the request',
    };
  }

  await updateTeamsAssistantRequest({
    client,
    id: request.id,
    ...feedback,
  });

  return { done: true };
};
