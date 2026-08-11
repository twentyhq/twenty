import { describe, expect, it } from 'vitest';

import { type SlackAssistantAnswer } from 'src/logic-functions/types/slack-assistant-answer.type';
import { buildSlackAssistantAnswerBlocks } from 'src/logic-functions/utils/build-slack-assistant-answer-blocks';

const WORKSPACE_BASE_URL = 'https://acme.twenty.com';
const TASK_ID = '20202020-89ab-4cde-8f01-234567890abc';
const COMPANY_ID = '20202020-1234-4abc-9def-567890abcdef';

const buildAnswer = (
  overrides: Partial<SlackAssistantAnswer> = {},
): SlackAssistantAnswer => ({
  answer: 'All done.',
  layout: 'plain',
  records: [],
  ...overrides,
});

const buildBlocks = (answer: SlackAssistantAnswer) =>
  buildSlackAssistantAnswerBlocks({
    answer,
    durationMilliseconds: 3000,
    workspaceBaseUrl: WORKSPACE_BASE_URL,
  });

describe('buildSlackAssistantAnswerBlocks', () => {
  it('should render a plain answer as the prose and a footer only', () => {
    expect(buildBlocks(buildAnswer())).toEqual([
      { type: 'markdown', text: 'All done.' },
      {
        type: 'context',
        elements: [
          { type: 'mrkdwn', text: 'AI-generated  ·  Answered in 3s' },
        ],
      },
    ]);
  });

  it('should render a record answer as one context line between prose and footer', () => {
    const blocks = buildBlocks(
      buildAnswer({
        layout: 'record',
        records: [
          {
            objectNameSingular: 'task',
            recordId: TASK_ID,
            name: 'Follow up with Housecall Pro',
            fields: [{ label: 'Status', value: 'Todo' }],
          },
        ],
      }),
    );

    expect(blocks.map((block) => block.type)).toEqual([
      'markdown',
      'context',
      'context',
    ]);
    expect(blocks[1]).toEqual({
      type: 'context',
      elements: [
        {
          type: 'mrkdwn',
          text: `:white_square_button: *<${WORKSPACE_BASE_URL}/object/task/${TASK_ID}|Follow up with Housecall Pro>*   ·   Status Todo`,
        },
      ],
    });
  });

  it('should render a list answer as a table', () => {
    const blocks = buildBlocks(
      buildAnswer({
        layout: 'list',
        records: [
          {
            objectNameSingular: 'company',
            recordId: COMPANY_ID,
            name: 'Housecall Pro',
            fields: [{ label: 'Domain', value: 'housecallpro.com' }],
          },
          {
            objectNameSingular: 'company',
            recordId: TASK_ID,
            name: 'Acme Corp',
            fields: [{ label: 'Domain', value: 'acme.com' }],
          },
        ],
      }),
    );

    expect(blocks.map((block) => block.type)).toEqual([
      'markdown',
      'table',
      'context',
    ]);
  });

  it('should fall back to context lines when list records share no field labels', () => {
    const blocks = buildBlocks(
      buildAnswer({
        layout: 'list',
        records: [
          {
            objectNameSingular: 'company',
            recordId: COMPANY_ID,
            name: 'Housecall Pro',
            fields: [{ label: 'Domain', value: 'housecallpro.com' }],
          },
          {
            objectNameSingular: 'task',
            recordId: TASK_ID,
            name: 'Follow up',
            fields: [{ label: 'Status', value: 'Todo' }],
          },
        ],
      }),
    );

    expect(blocks.map((block) => block.type)).toEqual([
      'markdown',
      'context',
      'context',
      'context',
    ]);
  });
});
