import { describe, expect, it } from 'vitest';

import { SLACK_MARKDOWN_BLOCK_MAX_LENGTH } from 'src/logic-functions/constants/slack-markdown-block-max-length';
import { buildSlackAssistantAnswerBlocks } from 'src/logic-functions/utils/build-slack-assistant-answer-blocks';

const REQUEST_ID = '3f77d0b1-30a1-4c3d-9d02-2f2a9f6f9d10';

describe('buildSlackAssistantAnswerBlocks', () => {
  it('should render the answer as a markdown block followed by feedback buttons', () => {
    expect(
      buildSlackAssistantAnswerBlocks({
        responseText: 'All done.',
        requestId: REQUEST_ID,
      }),
    ).toEqual([
      { type: 'markdown', text: 'All done.' },
      {
        type: 'context_actions',
        block_id: REQUEST_ID,
        elements: [
          {
            type: 'feedback_buttons',
            action_id: 'slack-assistant-feedback',
            positive_button: {
              text: { type: 'plain_text', text: 'Good response' },
              accessibility_label:
                'Mark the assistant answer as a good response',
              value: 'positive_feedback',
            },
            negative_button: {
              text: { type: 'plain_text', text: 'Bad response' },
              accessibility_label:
                'Mark the assistant answer as a bad response',
              value: 'negative_feedback',
            },
          },
        ],
      },
    ]);
  });

  it('should keep the record links the agent wrote inside the markdown block', () => {
    const responseText =
      'Created [ACME](https://acme.twenty.com/object/company/c-1).';

    const [markdownBlock] = buildSlackAssistantAnswerBlocks({
      responseText,
      requestId: REQUEST_ID,
    });

    expect(markdownBlock).toEqual({ type: 'markdown', text: responseText });
  });

  it('should keep the feedback buttons when the answer is too long for a markdown block', () => {
    const [markdownBlock, feedbackBlock] = buildSlackAssistantAnswerBlocks({
      responseText: 'a'.repeat(SLACK_MARKDOWN_BLOCK_MAX_LENGTH + 5000),
      requestId: REQUEST_ID,
      workspaceBaseUrl: 'https://acme.twenty.com',
    });

    expect(feedbackBlock).toEqual(
      expect.objectContaining({
        type: 'context_actions',
        block_id: REQUEST_ID,
        elements: [
          expect.objectContaining({
            type: 'feedback_buttons',
            action_id: 'slack-assistant-feedback',
          }),
        ],
      }),
    );
    expect(markdownBlock).toEqual({
      type: 'markdown',
      text: expect.stringContaining(
        `[Read the full answer in Twenty](https://acme.twenty.com/object/slackAssistantRequest/${REQUEST_ID})`,
      ),
    });
  });

  it('should keep a too long answer within the Slack markdown limit', () => {
    const [markdownBlock] = buildSlackAssistantAnswerBlocks({
      responseText: 'a'.repeat(SLACK_MARKDOWN_BLOCK_MAX_LENGTH + 5000),
      requestId: REQUEST_ID,
      workspaceBaseUrl: 'https://acme.twenty.com',
    });

    expect(
      (markdownBlock as { text: string }).text.length,
    ).toBeLessThanOrEqual(SLACK_MARKDOWN_BLOCK_MAX_LENGTH);
  });

  it('should cut a too long answer on a line break so markdown stays renderable', () => {
    const responseText = `${'a'.repeat(999)}\n`.repeat(20);

    const [markdownBlock] = buildSlackAssistantAnswerBlocks({
      responseText,
      requestId: REQUEST_ID,
    });

    const { text } = markdownBlock as { text: string };
    const keptText = text.slice(0, text.indexOf('\n\n_Shortened'));

    expect(text).toContain(
      '_Shortened to fit Slack. The full answer is on this request in Twenty._',
    );
    expect(responseText.startsWith(keptText)).toBe(true);
    expect(responseText[keptText.length]).toBe('\n');
  });
});
