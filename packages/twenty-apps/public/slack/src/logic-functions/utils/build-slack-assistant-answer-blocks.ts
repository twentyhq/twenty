import { type KnownBlock } from '@slack/web-api';

import { formatSlackAssistantDuration } from 'src/logic-functions/utils/format-slack-assistant-duration';

export const buildSlackAssistantAnswerBlocks = ({
  responseText,
  durationMilliseconds,
}: {
  responseText: string;
  durationMilliseconds: number;
}): KnownBlock[] => [
  { type: 'markdown', text: responseText },
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
