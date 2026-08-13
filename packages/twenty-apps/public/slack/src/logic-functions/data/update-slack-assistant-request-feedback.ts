import { type CoreApiClient } from 'twenty-client-sdk/core';

import { type SlackAssistantFeedbackRating } from 'src/logic-functions/constants/slack-assistant-feedback-rating';

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
