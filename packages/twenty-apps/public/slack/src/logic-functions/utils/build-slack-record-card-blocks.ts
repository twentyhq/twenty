import { type KnownBlock } from '@slack/web-api';

import { type SlackRecordCard } from 'src/logic-functions/types/slack-record-card.type';
import { escapeSlackMrkdwnText } from 'src/logic-functions/utils/escape-slack-mrkdwn-text';

const DETAIL_SEPARATOR = '  ·  ';

export const buildSlackRecordCardBlocks = (
  card: SlackRecordCard,
): KnownBlock[] => [
  { type: 'divider' },
  {
    type: 'section',
    text: {
      type: 'mrkdwn',
      text: `*${escapeSlackMrkdwnText(card.recordName)}*`,
    },
    accessory: {
      type: 'button',
      text: { type: 'plain_text', text: 'Open in Twenty' },
      url: card.recordUrl,
    },
  },
  {
    type: 'context',
    elements: [
      {
        type: 'mrkdwn',
        text: [card.objectLabel, ...card.details]
          .map(escapeSlackMrkdwnText)
          .join(DETAIL_SEPARATOR),
      },
    ],
  },
];
