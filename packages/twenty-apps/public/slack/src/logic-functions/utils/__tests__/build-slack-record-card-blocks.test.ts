import { describe, expect, it } from 'vitest';

import { buildSlackRecordCardBlocks } from 'src/logic-functions/utils/build-slack-record-card-blocks';

const RECORD_URL = 'https://acme.twenty.com/object/company/c-1';

describe('buildSlackRecordCardBlocks', () => {
  it('should render the record name with a button opening it in Twenty', () => {
    expect(
      buildSlackRecordCardBlocks({
        recordName: 'ACME',
        objectLabel: 'Company',
        recordUrl: RECORD_URL,
        details: ['acme.com', '$1,200,000'],
      }),
    ).toEqual([
      { type: 'divider' },
      {
        type: 'section',
        text: { type: 'mrkdwn', text: '*ACME*' },
        accessory: {
          type: 'button',
          text: { type: 'plain_text', text: 'Open in Twenty' },
          url: RECORD_URL,
        },
      },
      {
        type: 'context',
        elements: [
          {
            type: 'mrkdwn',
            text: 'Company  ·  acme.com  ·  $1,200,000',
          },
        ],
      },
    ]);
  });

  it('should keep the object label alone when the record has no details', () => {
    const [, , contextBlock] = buildSlackRecordCardBlocks({
      recordName: 'Follow up',
      objectLabel: 'Task',
      recordUrl: RECORD_URL,
      details: [],
    });

    expect(contextBlock).toEqual({
      type: 'context',
      elements: [{ type: 'mrkdwn', text: 'Task' }],
    });
  });

  it('should escape characters Slack would read as markup', () => {
    const [, sectionBlock] = buildSlackRecordCardBlocks({
      recordName: 'Smith & <Sons>',
      objectLabel: 'Company',
      recordUrl: RECORD_URL,
      details: [],
    });

    expect(sectionBlock).toEqual(
      expect.objectContaining({
        text: { type: 'mrkdwn', text: '*Smith &amp; &lt;Sons&gt;*' },
      }),
    );
  });
});
