import { describe, expect, it } from 'vitest';

import { type SlackRecordReference } from 'src/logic-functions/types/slack-record-reference.type';
import { buildSlackRecordCardBlocks } from 'src/logic-functions/utils/build-slack-record-card-blocks';

const buildReference = (index: number): SlackRecordReference => ({
  objectNameSingular: 'company',
  recordId: `20202020-0000-4000-8000-00000000000${index}`,
  recordName: `Company ${index}`,
  recordUrl: `https://acme.twenty.com/object/company/20202020-0000-4000-8000-00000000000${index}`,
});

describe('buildSlackRecordCardBlocks', () => {
  it('should return no blocks without references', () => {
    expect(
      buildSlackRecordCardBlocks({
        references: [],
        fieldLinesByRecordId: new Map(),
      }),
    ).toEqual([]);
  });

  it('should render a single reference as one card with fields and a link button', () => {
    const reference = buildReference(1);

    const blocks = buildSlackRecordCardBlocks({
      references: [reference],
      fieldLinesByRecordId: new Map([
        [reference.recordId, ['Domain: acme.com', 'Employees: 120']],
      ]),
    });

    expect(blocks).toEqual([
      {
        type: 'card',
        title: { type: 'mrkdwn', text: 'Company 1' },
        subtitle: { type: 'mrkdwn', text: 'Company' },
        body: { type: 'mrkdwn', text: 'Domain: acme.com\nEmployees: 120' },
        actions: [
          {
            type: 'button',
            text: { type: 'plain_text', text: 'Open in Twenty' },
            url: reference.recordUrl,
          },
        ],
      },
    ]);
  });

  it('should omit the body when no field lines were resolved', () => {
    const blocks = buildSlackRecordCardBlocks({
      references: [buildReference(1)],
      fieldLinesByRecordId: new Map(),
    });

    expect(blocks[0]).not.toHaveProperty('body');
  });

  it('should group several references into one carousel', () => {
    const blocks = buildSlackRecordCardBlocks({
      references: [buildReference(1), buildReference(2)],
      fieldLinesByRecordId: new Map(),
    });

    expect(blocks).toHaveLength(1);
    expect(blocks[0]).toMatchObject({ type: 'carousel' });
    expect(
      (blocks[0] as { elements: unknown[] }).elements,
    ).toHaveLength(2);
  });

  it('should render no cards when more records are referenced than the cap', () => {
    const references = Array.from({ length: 8 }, (_, index) =>
      buildReference(index),
    );

    const blocks = buildSlackRecordCardBlocks({
      references,
      fieldLinesByRecordId: new Map(),
    });

    expect(blocks).toEqual([]);
  });

  it('should render a full carousel at exactly the cap', () => {
    const references = Array.from({ length: 5 }, (_, index) =>
      buildReference(index),
    );

    const blocks = buildSlackRecordCardBlocks({
      references,
      fieldLinesByRecordId: new Map(),
    });

    expect(
      (blocks[0] as { elements: unknown[] }).elements,
    ).toHaveLength(5);
  });

  it('should escape mrkdwn control characters in record names', () => {
    const reference = {
      ...buildReference(1),
      recordName: 'Acme <Group> & Co',
    };

    const blocks = buildSlackRecordCardBlocks({
      references: [reference],
      fieldLinesByRecordId: new Map(),
    });

    expect(blocks[0]).toMatchObject({
      title: { type: 'mrkdwn', text: 'Acme &lt;Group&gt; &amp; Co' },
    });
  });
});
