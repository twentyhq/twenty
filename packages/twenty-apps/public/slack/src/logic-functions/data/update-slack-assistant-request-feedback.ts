import { type CoreApiClient } from 'twenty-client-sdk/core';

import { type SLACK_ASSISTANT_FEEDBACK_RATING } from 'src/logic-functions/constants/slack-assistant-feedback-rating';

type SlackAssistantFeedbackRating =
  (typeof SLACK_ASSISTANT_FEEDBACK_RATING)[keyof typeof SLACK_ASSISTANT_FEEDBACK_RATING];

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
