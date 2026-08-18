import { describe, expect, it } from 'vitest';

import { type SlackAssistantRecordCard } from 'src/logic-functions/types/slack-assistant-record-card.type';
import { buildSlackRecordCardBlocks } from 'src/logic-functions/utils/build-slack-record-card-blocks';

const ACME_URL =
  'https://acme.twenty.com/object/company/3f77d0b1-30a1-4c3d-9d02-2f2a9f6f9d10';

const buildCard = (
  overrides: Partial<SlackAssistantRecordCard> = {},
): SlackAssistantRecordCard => ({
  recordId: '3f77d0b1-30a1-4c3d-9d02-2f2a9f6f9d10',
  objectNameSingular: 'company',
  recordUrl: ACME_URL,
  title: 'ACME',
  subtitle: 'Software',
  fields: [
    { label: 'Stage', value: 'Proposal' },
    { label: 'Amount', value: '$120,000' },
  ],
  ...overrides,
});

describe('buildSlackRecordCardBlocks', () => {
  it('should render a divider, a linked title with an open button, a caption and the fields', () => {
    expect(buildSlackRecordCardBlocks(buildCard())).toEqual([
      { type: 'divider' },
      {
        type: 'section',
        text: { type: 'mrkdwn', text: `:office:  *<${ACME_URL}|ACME>*` },
        accessory: {
          type: 'button',
          text: { type: 'plain_text', text: 'Open in Twenty', emoji: true },
          url: ACME_URL,
          action_id: 'slack-assistant-open-record',
        },
      },
      {
        type: 'context',
        elements: [{ type: 'mrkdwn', text: 'Company · Software' }],
      },
      {
        type: 'section',
        fields: [
          { type: 'mrkdwn', text: '*Stage*\nProposal' },
          { type: 'mrkdwn', text: '*Amount*\n$120,000' },
        ],
      },
    ]);
  });

  it('should caption with the object alone when the card has no subtitle', () => {
    const [, , captionBlock] = buildSlackRecordCardBlocks(
      buildCard({ objectNameSingular: 'opportunity', subtitle: undefined }),
    );

    expect(captionBlock).toEqual({
      type: 'context',
      elements: [{ type: 'mrkdwn', text: 'Opportunity' }],
    });
  });

  it('should fall back to a generic emoji and a readable label for custom objects', () => {
    const [, titleBlock, captionBlock] = buildSlackRecordCardBlocks(
      buildCard({ objectNameSingular: 'supportTicket', subtitle: undefined }),
    );

    expect(titleBlock).toMatchObject({
      text: { text: `:card_index:  *<${ACME_URL}|ACME>*` },
    });
    expect(captionBlock).toMatchObject({
      elements: [{ text: 'Support ticket' }],
    });
  });
});
