import { type KnownBlock, type MessageAttachment } from '@slack/web-api';

import { type SlackRecordUnfurlCard } from 'src/logic-functions/types/slack-record-unfurl-card.type';

const escapeSlackMrkdwn = (text: string): string =>
  text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

export const buildSlackRecordUnfurlAttachment = ({
  linkUrl,
  card,
}: {
  linkUrl: string;
  card: SlackRecordUnfurlCard;
}): MessageAttachment => {
  const blocks: KnownBlock[] = [
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `*<${linkUrl}|${escapeSlackMrkdwn(card.recordTitle)}>*`,
      },
    },
  ];

  if (card.fields.length > 0) {
    blocks.push({
      type: 'section',
      fields: card.fields.map((field) => ({
        type: 'mrkdwn' as const,
        text: `*${escapeSlackMrkdwn(field.label)}*\n${escapeSlackMrkdwn(field.value)}`,
      })),
    });
  }

  blocks.push({
    type: 'context',
    elements: [
      {
        type: 'mrkdwn',
        text: `${escapeSlackMrkdwn(card.objectLabel)} in Twenty`,
      },
    ],
  });

  return { blocks };
};
