import { type CoreApiClient } from 'twenty-client-sdk/core';
import { isDefined } from 'twenty-sdk/utils';

import { type TeamsAssistantFeedbackRating } from 'src/features/chat/logic-functions/types/teams-assistant-feedback-rating.type';
import { type TeamsAssistantRequestStatus } from 'src/features/chat/logic-functions/types/teams-assistant-request-status.type';

export const updateTeamsAssistantRequest = async ({
  client,
  id,
  status,
  responseText,
  errorMessage,
  workspaceMemberId,
  requestText,
  name,
  teamsAnswerActivityId,
  feedbackRating,
  feedbackText,
}: {
  client: Pick<CoreApiClient, 'mutation'>;
  id: string;
  status?: TeamsAssistantRequestStatus;
  responseText?: string;
  errorMessage?: string;
  workspaceMemberId?: string;
  requestText?: string;
  name?: string;
  teamsAnswerActivityId?: string;
  feedbackRating?: TeamsAssistantFeedbackRating;
  feedbackText?: string;
}): Promise<void> => {
  await client.mutation({
    updateTeamsAssistantRequest: {
      __args: {
        id,
        data: {
          ...(isDefined(status) ? { status } : {}),
          ...(isDefined(responseText)
            ? { responseText: { blocknote: null, markdown: responseText } }
            : {}),
          ...(isDefined(errorMessage) ? { errorMessage } : {}),
          ...(isDefined(workspaceMemberId) ? { workspaceMemberId } : {}),
          ...(isDefined(requestText)
            ? { requestText: { blocknote: null, markdown: requestText } }
            : {}),
          ...(isDefined(name) ? { name } : {}),
          ...(isDefined(teamsAnswerActivityId)
            ? { teamsAnswerActivityId }
            : {}),
          ...(isDefined(feedbackRating) ? { feedbackRating } : {}),
          ...(isDefined(feedbackText) ? { feedbackText } : {}),
        },
      },
      id: true,
    },
  });
};
