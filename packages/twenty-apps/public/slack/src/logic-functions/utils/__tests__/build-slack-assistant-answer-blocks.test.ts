import { describe, expect, it } from 'vitest';

import { buildSlackAssistantAnswerBlocks } from 'src/logic-functions/utils/build-slack-assistant-answer-blocks';

const REQUEST_ID = '3f77d0b1-30a1-4c3d-9d02-2f2a9f6f9d10';

describe('buildSlackAssistantAnswerBlocks', () => {
  it('should render the answer as a markdown block followed by a duration footer and feedback buttons', () => {
    expect(
      buildSlackAssistantAnswerBlocks({
        responseText: 'All done.',
        durationMilliseconds: 3000,
        requestId: REQUEST_ID,
      }),
    ).toEqual([
      { type: 'markdown', text: 'All done.' },
      {
        type: 'context',
        elements: [{ type: 'mrkdwn', text: 'Answered in 3s' }],
      },
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
      durationMilliseconds: 1000,
      requestId: REQUEST_ID,
    });

    expect(markdownBlock).toEqual({ type: 'markdown', text: responseText });
  });

});
