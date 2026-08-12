import { type KnownBlock } from '@slack/web-api';

import { type SlackRecordCard } from 'src/logic-functions/types/slack-record-card.type';
import { buildSlackRecordCardBlocks } from 'src/logic-functions/utils/build-slack-record-card-blocks';
import { formatSlackAssistantDuration } from 'src/logic-functions/utils/format-slack-assistant-duration';

export const buildSlackAssistantAnswerBlocks = ({
  responseText,
  durationMilliseconds,
  recordCard,
}: {
  responseText: string;
  durationMilliseconds: number;
  recordCard?: SlackRecordCard;
}): KnownBlock[] => [
  { type: 'markdown', text: responseText },
  ...(recordCard === undefined ? [] : buildSlackRecordCardBlocks(recordCard)),
  {
    type: 'context',
    elements: [
      {
        type: 'mrkdwn',
        text: `Answered in ${formatSlackAssistantDuration(durationMilliseconds)}`,
      },
    ],
  },
];
