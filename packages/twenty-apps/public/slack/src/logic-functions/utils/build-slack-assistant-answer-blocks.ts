import { type KnownBlock } from '@slack/web-api';

import { SLACK_MARKDOWN_BLOCK_MAX_LENGTH } from 'src/logic-functions/constants/slack-markdown-block-max-length';
import { formatSlackAssistantDuration } from 'src/logic-functions/utils/format-slack-assistant-duration';

// Split rather than truncate: a truncated block is still valid, so Slack would
// accept it and the body fallbacks would never run to rescue the dropped tail.
const splitIntoMarkdownBlockTexts = (text: string): string[] => {
  const blockTexts: string[] = [];
  let remainingText = text;

  while (remainingText.length > SLACK_MARKDOWN_BLOCK_MAX_LENGTH) {
    const window = remainingText.slice(0, SLACK_MARKDOWN_BLOCK_MAX_LENGTH);
    const lastLineBreakIndex = window.lastIndexOf('\n');
    // Splitting after the break keeps it in the preceding block, so the blocks
    // still concatenate back to exactly what the agent wrote.
    const splitIndex =
      lastLineBreakIndex > 0 ? lastLineBreakIndex + 1 : window.length;

    blockTexts.push(remainingText.slice(0, splitIndex));
    remainingText = remainingText.slice(splitIndex);
  }

  if (remainingText.length > 0) {
    blockTexts.push(remainingText);
  }

  return blockTexts;
};

export const buildSlackAssistantAnswerBlocks = ({
  responseText,
  durationMilliseconds,
}: {
  responseText: string;
  durationMilliseconds: number;
}): KnownBlock[] => [
  ...splitIntoMarkdownBlockTexts(responseText).map(
    (blockText): KnownBlock => ({ type: 'markdown', text: blockText }),
  ),
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
