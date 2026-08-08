import { describe, expect, it } from 'vitest';

import { type SlackRecordDetails } from 'src/logic-functions/types/slack-record-details.type';
import { type SlackRecordReference } from 'src/logic-functions/types/slack-record-reference.type';
import { buildSlackRecordBlocks } from 'src/logic-functions/utils/build-slack-record-blocks';

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

describe('buildSlackRecordBlocks', () => {
  it('should return no blocks without references', () => {
    expect(
      buildSlackRecordBlocks({
        references: [],
        detailsByRecordId: new Map(),
      }),
    ).toEqual([]);
  });

  it('should render a record as an unfurl-style section with a linked name and field grid', () => {
    const reference = buildReference(1);

    const blocks = buildSlackRecordBlocks({
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

    expect(blocks).toEqual([
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
    ]);
  });

  it('should attach the company logo as an accessory image when resolved', () => {
    const reference = buildReference(1);

    const blocks = buildSlackRecordBlocks({
      references: [reference],
      detailsByRecordId: new Map([
        [
          reference.recordId,
          buildDetails({ imageUrl: 'https://favicon.example/acme.png' }),
        ],
      ]),
    });

    expect(blocks[0]).toMatchObject({
      accessory: {
        type: 'image',
        image_url: 'https://favicon.example/acme.png',
        alt_text: 'Company 1 logo',
      },
    });
  });

  it('should skip records that resolved no fields instead of rendering an empty frame', () => {
    const withFields = buildReference(1);
    const withoutFields = buildReference(2);

    const blocks = buildSlackRecordBlocks({
      references: [withFields, withoutFields],
      detailsByRecordId: new Map([
        [withFields.recordId, buildDetails()],
        [withoutFields.recordId, buildDetails({ fields: [] })],
      ]),
    });

    expect(blocks).toHaveLength(1);
    expect(blocks[0].type).toBe('section');
  });

  it('should render nothing when no record resolved fields', () => {
    const blocks = buildSlackRecordBlocks({
      references: [buildReference(1)],
      detailsByRecordId: new Map(),
    });

    expect(blocks).toEqual([]);
  });

  it('should separate multiple records with dividers', () => {
    const references = [buildReference(1), buildReference(2), buildReference(3)];

    const blocks = buildSlackRecordBlocks({
      references,
      detailsByRecordId: new Map(
        references.map((reference) => [reference.recordId, buildDetails()]),
      ),
    });

    expect(blocks.map((block) => block.type)).toEqual([
      'section',
      'divider',
      'section',
      'divider',
      'section',
    ]);
  });

  it('should render no blocks when more records are referenced than the cap', () => {
    const references = Array.from({ length: 8 }, (_, index) =>
      buildReference(index),
    );

    const blocks = buildSlackRecordBlocks({
      references,
      detailsByRecordId: new Map(
        references.map((reference) => [reference.recordId, buildDetails()]),
      ),
    });

    expect(blocks).toEqual([]);
  });

  it('should escape mrkdwn control characters in names and field values', () => {
    const reference = {
      ...buildReference(1),
      recordName: 'Acme <Group> & Co',
    };

    const blocks = buildSlackRecordBlocks({
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

    expect(blocks[0]).toMatchObject({
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

    const blocks = buildSlackRecordBlocks({
      references: [reference],
      detailsByRecordId: new Map([[reference.recordId, buildDetails()]]),
    });

    const text = (blocks[0] as { text: { text: string } }).text.text;
    const linkedName = text.slice(
      text.indexOf('|') + 1,
      text.indexOf('>*'),
    );

    expect(linkedName.length).toBeLessThanOrEqual(150);
    expect(linkedName).not.toMatch(/&(?!amp;|lt;|gt;)/);
    expect(linkedName.endsWith('…')).toBe(true);
  });
});
