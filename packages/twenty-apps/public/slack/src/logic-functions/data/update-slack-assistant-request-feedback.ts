import { type CoreApiClient } from 'twenty-client-sdk/core';

import { type SlackAssistantFeedbackRating } from 'src/logic-functions/types/slack-assistant-feedback-rating.type';

export const updateSlackAssistantRequestFeedback = async (
  client: CoreApiClient,
  {
    id,
    feedbackRating,
  }: {
    id: string;
    feedbackRating: SlackAssistantFeedbackRating;
  },
): Promise<void> => {
  await client.mutation({
    updateSlackAssistantRequest: {
      __args: {
        id,
        data: { feedbackRating },
      },
      id: true,
    },
  });
};
