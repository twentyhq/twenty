import { describe, expect, it } from 'vitest';

import { type SlackRecordDetails } from 'src/logic-functions/types/slack-record-details.type';
import { type SlackRecordReference } from 'src/logic-functions/types/slack-record-reference.type';
import { buildSlackRecordAttachments } from 'src/logic-functions/utils/build-slack-record-attachments';

const buildReference = (index: number): SlackRecordReference => ({
  objectNameSingular: 'company',
  recordId: `20202020-0000-4000-8000-00000000000${index}`,
  recordName: `Company ${index}`,
  recordUrl: `https://acme.twenty.com/object/company/20202020-0000-4000-8000-00000000000${index}`,
});

const buildDetails = (
  overrides: Partial<SlackRecordDetails> = {},
): SlackRecordDetails => ({
  fields: [{ label: 'Domain', value: 'acme.com' }],
  ...overrides,
});

describe('buildSlackRecordAttachments', () => {
  it('should return no attachments without references', () => {
    expect(
      buildSlackRecordAttachments({
        references: [],
        detailsByRecordId: new Map(),
      }),
    ).toEqual([]);
  });

  it('should render a record as an accent-bar attachment with a linked name and field grid', () => {
    const reference = buildReference(1);

    const attachments = buildSlackRecordAttachments({
      references: [reference],
      detailsByRecordId: new Map([
        [
          reference.recordId,
          buildDetails({
            fields: [
              { label: 'Domain', value: 'acme.com' },
              { label: 'Annual revenue', value: '$2,000,000' },
            ],
          }),
        ],
      ]),
    });

    expect(attachments).toEqual([
      {
        color: '#3E63DD',
        fallback: 'Company 1',
        blocks: [
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: `*<${reference.recordUrl}|Company 1>*   ·   Company`,
            },
            fields: [
              { type: 'mrkdwn', text: '*Domain*\nacme.com' },
              { type: 'mrkdwn', text: '*Annual revenue*\n$2,000,000' },
            ],
          },
        ],
      },
    ]);
  });

  it('should attach the company logo as an accessory image when resolved', () => {
    const reference = buildReference(1);

    const attachments = buildSlackRecordAttachments({
      references: [reference],
      detailsByRecordId: new Map([
        [
          reference.recordId,
          buildDetails({ imageUrl: 'https://favicon.example/acme.png' }),
        ],
      ]),
    });

    expect(attachments[0].blocks?.[0]).toMatchObject({
      accessory: {
        type: 'image',
        image_url: 'https://favicon.example/acme.png',
        alt_text: 'Company 1 logo',
      },
    });
  });

  it('should skip records that resolved no fields instead of rendering an empty bar', () => {
    const withFields = buildReference(1);
    const withoutFields = buildReference(2);

    const attachments = buildSlackRecordAttachments({
      references: [withFields, withoutFields],
      detailsByRecordId: new Map([
        [withFields.recordId, buildDetails()],
        [withoutFields.recordId, buildDetails({ fields: [] })],
      ]),
    });

    expect(attachments).toHaveLength(1);
    expect(attachments[0].fallback).toBe('Company 1');
  });

  it('should render nothing when no record resolved fields', () => {
    const attachments = buildSlackRecordAttachments({
      references: [buildReference(1)],
      detailsByRecordId: new Map(),
    });

    expect(attachments).toEqual([]);
  });

  it('should render one attachment per record', () => {
    const references = [buildReference(1), buildReference(2), buildReference(3)];

    const attachments = buildSlackRecordAttachments({
      references,
      detailsByRecordId: new Map(
        references.map((reference) => [reference.recordId, buildDetails()]),
      ),
    });

    expect(attachments.map((attachment) => attachment.fallback)).toEqual([
      'Company 1',
      'Company 2',
      'Company 3',
    ]);
  });

  it('should render no attachments when more records are referenced than the cap', () => {
    const references = Array.from({ length: 8 }, (_, index) =>
      buildReference(index),
    );

    const attachments = buildSlackRecordAttachments({
      references,
      detailsByRecordId: new Map(
        references.map((reference) => [reference.recordId, buildDetails()]),
      ),
    });

    expect(attachments).toEqual([]);
  });

  it('should escape mrkdwn control characters in names and field values', () => {
    const reference = {
      ...buildReference(1),
      recordName: 'Acme <Group> & Co',
    };

    const attachments = buildSlackRecordAttachments({
      references: [reference],
      detailsByRecordId: new Map([
        [
          reference.recordId,
          buildDetails({
            fields: [{ label: 'Domain', value: 'a<b>.com & more' }],
          }),
        ],
      ]),
    });

    expect(attachments[0].blocks?.[0]).toMatchObject({
      text: {
        text: `*<${reference.recordUrl}|Acme &lt;Group&gt; &amp; Co>*   ·   Company`,
      },
      fields: [{ type: 'mrkdwn', text: '*Domain*\na&lt;b&gt;.com &amp; more' }],
    });
  });

  it('should truncate long names without splitting an escaped entity', () => {
    const reference = {
      ...buildReference(1),
      recordName: `${'x'.repeat(146)} & Co`,
    };

    const attachments = buildSlackRecordAttachments({
      references: [reference],
      detailsByRecordId: new Map([[reference.recordId, buildDetails()]]),
    });

    const section = attachments[0].blocks?.[0] as {
      text: { text: string };
    };
    const text = section.text.text;
    const linkedName = text.slice(text.indexOf('|') + 1, text.indexOf('>*'));

    expect(linkedName.length).toBeLessThanOrEqual(150);
    expect(linkedName).not.toMatch(/&(?!amp;|lt;|gt;)/);
    expect(linkedName.endsWith('…')).toBe(true);
  });
});
