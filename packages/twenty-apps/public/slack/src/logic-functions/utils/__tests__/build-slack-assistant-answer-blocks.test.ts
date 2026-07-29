import { describe, expect, it } from 'vitest';

import { SLACK_MARKDOWN_BLOCK_MAX_LENGTH } from 'src/logic-functions/constants/slack-markdown-block-max-length';
import { buildSlackAssistantAnswerBlocks } from 'src/logic-functions/utils/build-slack-assistant-answer-blocks';

const WORKSPACE_BASE_URL = 'https://acme.twenty.com';

describe('buildSlackAssistantAnswerBlocks', () => {
  it('should render the answer as a markdown block followed by a duration footer', () => {
    expect(
      buildSlackAssistantAnswerBlocks({
        responseText: 'All done.',
        durationMilliseconds: 3000,
        workspaceBaseUrl: WORKSPACE_BASE_URL,
      }),
    ).toEqual([
      { type: 'markdown', text: 'All done.' },
      {
        type: 'context',
        elements: [{ type: 'mrkdwn', text: 'Answered in 3s' }],
      },
    ]);
  });

  it('should add a chip for every record the answer links, using legacy mrkdwn link syntax', () => {
    const responseText = `Created [ACME](${WORKSPACE_BASE_URL}/object/company/c-1) and [John Doe](${WORKSPACE_BASE_URL}/object/person/p-1).`;

    const [, footerBlock] = buildSlackAssistantAnswerBlocks({
      responseText,
      durationMilliseconds: 1000,
      workspaceBaseUrl: WORKSPACE_BASE_URL,
    });

    expect(footerBlock).toEqual({
      type: 'context',
      elements: [
        {
          type: 'mrkdwn',
          text: `<${WORKSPACE_BASE_URL}/object/company/c-1|ACME>  ·  <${WORKSPACE_BASE_URL}/object/person/p-1|John Doe>`,
        },
        { type: 'mrkdwn', text: 'Answered in 1s' },
      ],
    });
  });

  it('should omit the record chips when the workspace base URL is unknown', () => {
    const responseText = `Created [ACME](${WORKSPACE_BASE_URL}/object/company/c-1).`;

    const [, footerBlock] = buildSlackAssistantAnswerBlocks({
      responseText,
      durationMilliseconds: 1000,
      workspaceBaseUrl: undefined,
    });

    expect(footerBlock).toEqual({
      type: 'context',
      elements: [{ type: 'mrkdwn', text: 'Answered in 1s' }],
    });
  });

  it('should truncate an answer that exceeds the markdown block limit', () => {
    const [markdownBlock] = buildSlackAssistantAnswerBlocks({
      responseText: 'a'.repeat(SLACK_MARKDOWN_BLOCK_MAX_LENGTH + 500),
      durationMilliseconds: 1000,
      workspaceBaseUrl: WORKSPACE_BASE_URL,
    });

    expect(markdownBlock).toEqual({
      type: 'markdown',
      text: `${'a'.repeat(SLACK_MARKDOWN_BLOCK_MAX_LENGTH - 1)}…`,
    });
  });
});
