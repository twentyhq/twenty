import { type KnownBlock } from '@slack/web-api';

import { formatSlackAssistantDuration } from 'src/logic-functions/utils/format-slack-assistant-duration';

export const buildSlackAssistantAnswerBlocks = ({
  responseText,
  durationMilliseconds,
  recordCardBlocks = [],
}: {
  responseText: string;
  durationMilliseconds: number;
  recordCardBlocks?: KnownBlock[];
}): KnownBlock[] => [
  { type: 'markdown', text: responseText },
  ...recordCardBlocks,
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
