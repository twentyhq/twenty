import { type KnownBlock } from '@slack/web-api';
import { isDefined } from 'twenty-sdk/utils';

import { SLACK_ASSISTANT_FEEDBACK_ACTION_ID } from 'src/logic-functions/constants/slack-assistant-feedback-action-id';
import { SLACK_ASSISTANT_FEEDBACK_BUTTON_VALUE } from 'src/logic-functions/constants/slack-assistant-feedback-button-value';
import { type SlackAssistantRecordCard } from 'src/logic-functions/types/slack-assistant-record-card.type';
import { buildSlackRecordCardBlocks } from 'src/logic-functions/utils/build-slack-record-card-blocks';
import { formatSlackAssistantDuration } from 'src/logic-functions/utils/format-slack-assistant-duration';

export const buildSlackAssistantAnswerBlocks = ({
  responseText,
  durationMilliseconds,
  requestId,
  recordCard,
}: {
  responseText: string;
  durationMilliseconds: number;
  requestId: string;
  recordCard?: SlackAssistantRecordCard;
}): KnownBlock[] => [
  { type: 'markdown', text: responseText },
  ...(isDefined(recordCard) ? buildSlackRecordCardBlocks(recordCard) : []),
  {
    type: 'context',
    elements: [
      {
        type: 'mrkdwn',
        text: `Answered in ${formatSlackAssistantDuration(durationMilliseconds)}`,
      },
    ],
  },
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
