import { type KnownBlock } from '@slack/web-api';

import { formatSlackAssistantDuration } from 'src/logic-functions/utils/format-slack-assistant-duration';

export const buildSlackAssistantAnswerBlocks = ({
  responseText,
  durationMilliseconds,
  recordBlocks = [],
}: {
  responseText: string;
  durationMilliseconds: number;
  recordBlocks?: KnownBlock[];
}): KnownBlock[] => [
  { type: 'markdown', text: responseText },
  ...recordBlocks,
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
