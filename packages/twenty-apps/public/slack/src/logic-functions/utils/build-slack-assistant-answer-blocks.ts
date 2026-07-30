import { type KnownBlock } from '@slack/web-api';

import { SLACK_MARKDOWN_BLOCK_MAX_LENGTH } from 'src/logic-functions/constants/slack-markdown-block-max-length';
import { formatSlackAssistantDuration } from 'src/logic-functions/utils/format-slack-assistant-duration';

const TRUNCATION_SUFFIX = '…';

const truncateForMarkdownBlock = (text: string): string =>
  text.length <= SLACK_MARKDOWN_BLOCK_MAX_LENGTH
    ? text
    : `${text.slice(0, SLACK_MARKDOWN_BLOCK_MAX_LENGTH - TRUNCATION_SUFFIX.length)}${TRUNCATION_SUFFIX}`;

export const buildSlackAssistantAnswerBlocks = ({
  responseText,
  durationMilliseconds,
}: {
  responseText: string;
  durationMilliseconds: number;
}): KnownBlock[] => [
  { type: 'markdown', text: truncateForMarkdownBlock(responseText) },
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
