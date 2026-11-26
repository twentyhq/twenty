import { type CoreApiClient } from 'twenty-client-sdk/core';

import { type TeamsAssistantFeedbackRating } from 'src/features/chat/logic-functions/types/teams-assistant-feedback-rating.type';

export const updateTeamsAssistantRequestFeedback = async ({
  client,
  id,
  feedbackRating,
  feedbackText,
}: {
  client: Pick<CoreApiClient, 'mutation'>;
  id: string;
  feedbackRating: TeamsAssistantFeedbackRating;
  feedbackText: string;
}): Promise<void> => {
  await client.mutation({
    updateTeamsAssistantRequest: {
      __args: {
        id,
        data: { feedbackRating, feedbackText },
      },
      id: true,
    },
  });
};
