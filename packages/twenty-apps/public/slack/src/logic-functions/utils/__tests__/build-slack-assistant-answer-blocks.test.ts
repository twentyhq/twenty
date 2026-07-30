import { describe, expect, it } from 'vitest';

import { SLACK_MARKDOWN_BLOCK_MAX_LENGTH } from 'src/logic-functions/constants/slack-markdown-block-max-length';
import { buildSlackAssistantAnswerBlocks } from 'src/logic-functions/utils/build-slack-assistant-answer-blocks';

describe('buildSlackAssistantAnswerBlocks', () => {
  it('should render the answer as a markdown block followed by a duration footer', () => {
    expect(
      buildSlackAssistantAnswerBlocks({
        responseText: 'All done.',
        durationMilliseconds: 3000,
      }),
    ).toEqual([
      { type: 'markdown', text: 'All done.' },
      {
        type: 'context',
        elements: [{ type: 'mrkdwn', text: 'Answered in 3s' }],
      },
    ]);
  });

  it('should keep the record links the agent wrote inside the markdown block', () => {
    const responseText =
      'Created [ACME](https://acme.twenty.com/object/company/c-1).';

    const [markdownBlock] = buildSlackAssistantAnswerBlocks({
      responseText,
      durationMilliseconds: 1000,
    });

    expect(markdownBlock).toEqual({ type: 'markdown', text: responseText });
  });

  it('should truncate an answer that exceeds the markdown block limit', () => {
    const [markdownBlock] = buildSlackAssistantAnswerBlocks({
      responseText: 'a'.repeat(SLACK_MARKDOWN_BLOCK_MAX_LENGTH + 500),
      durationMilliseconds: 1000,
    });

    expect(markdownBlock).toEqual({
      type: 'markdown',
      text: `${'a'.repeat(SLACK_MARKDOWN_BLOCK_MAX_LENGTH - 1)}…`,
    });
  });
});
