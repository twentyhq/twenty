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

  it('should split an answer that exceeds the markdown block limit instead of dropping the tail', () => {
    const responseText = 'a'.repeat(SLACK_MARKDOWN_BLOCK_MAX_LENGTH + 500);

    const blocks = buildSlackAssistantAnswerBlocks({
      responseText,
      durationMilliseconds: 1000,
    });

    const markdownBlocks = blocks.filter((block) => block.type === 'markdown');

    expect(markdownBlocks).toHaveLength(2);
    expect(markdownBlocks.map((block) => block.text).join('')).toBe(
      responseText,
    );
    expect(
      markdownBlocks.every(
        (block) => block.text.length <= SLACK_MARKDOWN_BLOCK_MAX_LENGTH,
      ),
    ).toBe(true);
  });

  it('should split on a line break so formatting is not cut mid-line', () => {
    const firstLine = 'a'.repeat(SLACK_MARKDOWN_BLOCK_MAX_LENGTH - 10);
    const secondLine = 'b'.repeat(100);
    const responseText = `${firstLine}\n${secondLine}`;

    const markdownBlocks = buildSlackAssistantAnswerBlocks({
      responseText,
      durationMilliseconds: 1000,
    }).filter((block) => block.type === 'markdown');

    expect(markdownBlocks.map((block) => block.text)).toEqual([
      `${firstLine}\n`,
      secondLine,
    ]);
    expect(markdownBlocks.map((block) => block.text).join('')).toBe(
      responseText,
    );
  });
});
