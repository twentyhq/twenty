import { describe, expect, it } from 'vitest';

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

  it('should place record card blocks between the answer and the footer', () => {
    const recordCardBlocks = [
      { type: 'card' as const, title: { type: 'mrkdwn' as const, text: 'Acme' } },
    ];

    const blocks = buildSlackAssistantAnswerBlocks({
      responseText: 'Here is Acme.',
      durationMilliseconds: 1000,
      recordCardBlocks,
    });

    expect(blocks.map((block) => block.type)).toEqual([
      'markdown',
      'card',
      'context',
    ]);
  });
});
