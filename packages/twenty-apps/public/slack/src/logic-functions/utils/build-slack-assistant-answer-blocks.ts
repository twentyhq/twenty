import { type KnownBlock } from '@slack/web-api';

import { SLACK_ASSISTANT_FEEDBACK_ACTION_ID } from 'src/logic-functions/constants/slack-assistant-feedback-action-id';
import { SLACK_ASSISTANT_FEEDBACK_BUTTON_VALUE } from 'src/logic-functions/constants/slack-assistant-feedback-button-value';

export const buildSlackAssistantAnswerBlocks = ({
  responseText,
  requestId,
}: {
  responseText: string;
  requestId: string;
}): KnownBlock[] => [
  { type: 'markdown', text: responseText },
  {
    type: 'context_actions',
    block_id: requestId,
    elements: [
      {
        type: 'feedback_buttons',
        action_id: SLACK_ASSISTANT_FEEDBACK_ACTION_ID,
        positive_button: {
          text: { type: 'plain_text', text: 'Good response' },
          accessibility_label: 'Mark the assistant answer as a good response',
          value: SLACK_ASSISTANT_FEEDBACK_BUTTON_VALUE.POSITIVE,
        },
        negative_button: {
          text: { type: 'plain_text', text: 'Bad response' },
          accessibility_label: 'Mark the assistant answer as a bad response',
          value: SLACK_ASSISTANT_FEEDBACK_BUTTON_VALUE.NEGATIVE,
        },
      },
    ],
  },
];
