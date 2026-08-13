import { describe, expect, it } from 'vitest';

import { buildSlackRecordUnfurlAttachment } from 'src/logic-functions/utils/build-slack-record-unfurl-attachment';

describe('buildSlackRecordUnfurlAttachment', () => {
  it('should build a title, fields and context blocks', () => {
    const attachment = buildSlackRecordUnfurlAttachment({
      linkUrl: 'https://acme.twenty.com/object/opportunity/id-1',
      card: {
        recordTitle: 'Big deal',
        objectLabel: 'Opportunity',
        fields: [
          { label: 'Stage', value: 'Proposal' },
          { label: 'Amount', value: '$10,000' },
        ],
      },
    });

    expect(attachment.blocks).toEqual([
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: '*<https://acme.twenty.com/object/opportunity/id-1|Big deal>*',
        },
      },
      {
        type: 'section',
        fields: [
          { type: 'mrkdwn', text: '*Stage*\nProposal' },
          { type: 'mrkdwn', text: '*Amount*\n$10,000' },
        ],
      },
      {
        type: 'context',
        elements: [{ type: 'mrkdwn', text: 'Opportunity in Twenty' }],
      },
    ]);
  });

  it('should omit the fields block when there are no fields', () => {
    const attachment = buildSlackRecordUnfurlAttachment({
      linkUrl: 'https://acme.twenty.com/object/note/id-1',
      card: { recordTitle: 'A note', objectLabel: 'Note', fields: [] },
    });

    expect(attachment.blocks).toHaveLength(2);
    expect(attachment.blocks?.[1]?.type).toBe('context');
  });

  it('should encode mrkdwn link delimiters in the embedded url', () => {
    const attachment = buildSlackRecordUnfurlAttachment({
      linkUrl: 'https://acme.twenty.com/object/person/id-1?view=a|b<c>',
      card: { recordTitle: 'Jane Doe', objectLabel: 'Person', fields: [] },
    });

    expect(attachment.blocks?.[0]).toEqual({
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: '*<https://acme.twenty.com/object/person/id-1?view=a%7Cb%3Cc%3E|Jane Doe>*',
      },
    });
  });

  it('should truncate oversized titles and field values under Slack limits', () => {
    const attachment = buildSlackRecordUnfurlAttachment({
      linkUrl: 'https://acme.twenty.com/object/note/id-1',
      card: {
        recordTitle: 'a'.repeat(5000),
        objectLabel: 'Note',
        fields: [{ label: 'Created by', value: 'b'.repeat(5000) }],
      },
    });

    const titleBlock = attachment.blocks?.[0] as {
      text: { text: string };
    };
    const fieldsBlock = attachment.blocks?.[1] as {
      fields: { text: string }[];
    };

    expect(titleBlock.text.text.length).toBeLessThanOrEqual(3000);
    expect(titleBlock.text.text).toContain('…');
    expect(fieldsBlock.fields[0].text.length).toBeLessThanOrEqual(2000);
    expect(fieldsBlock.fields[0].text).toContain('…');
  });

  it('should not split surrogate pairs when truncating', () => {
    const attachment = buildSlackRecordUnfurlAttachment({
      linkUrl: 'https://acme.twenty.com/object/note/id-1',
      card: {
        recordTitle: '😀'.repeat(400),
        objectLabel: 'Note',
        fields: [],
      },
    });

    const titleBlock = attachment.blocks?.[0] as {
      text: { text: string };
    };
    const loneSurrogatePattern = /[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?<![\uD800-\uDBFF])[\uDC00-\uDFFF]/;

    expect(titleBlock.text.text).toContain('…');
    expect(loneSurrogatePattern.test(titleBlock.text.text)).toBe(false);
  });

  it('should escape mrkdwn control characters in titles and values', () => {
    const attachment = buildSlackRecordUnfurlAttachment({
      linkUrl: 'https://acme.twenty.com/object/company/id-1',
      card: {
        recordTitle: 'Tom & Jerry <Corp>',
        objectLabel: 'Company',
        fields: [{ label: 'Domain', value: 'a<b>.com' }],
      },
    });

    expect(attachment.blocks?.[0]).toEqual({
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: '*<https://acme.twenty.com/object/company/id-1|Tom &amp; Jerry &lt;Corp&gt;>*',
      },
    });
    expect(attachment.blocks?.[1]).toEqual({
      type: 'section',
      fields: [{ type: 'mrkdwn', text: '*Domain*\na&lt;b&gt;.com' }],
    });
  });
});
