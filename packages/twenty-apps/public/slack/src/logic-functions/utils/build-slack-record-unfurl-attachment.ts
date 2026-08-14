import { type KnownBlock, type MessageAttachment } from '@slack/web-api';

import { type SlackRecordUnfurlCard } from 'src/logic-functions/types/slack-record-unfurl-card.type';

// Raw lengths are capped before escaping so that even worst-case entity
// expansion stays well under Slack's Block Kit limits (3000 chars for a
// section text, 2000 per field text).
const TITLE_MAX_LENGTH = 250;
const FIELD_VALUE_MAX_LENGTH = 350;

const truncateText = ({
  text,
  maxLength,
}: {
  text: string;
  maxLength: number;
}): string => {
  // Slicing by code point keeps surrogate pairs intact at the boundary
  const characters = Array.from(text);

  return characters.length > maxLength
    ? `${characters.slice(0, maxLength - 1).join('')}…`
    : text;
};

const escapeSlackMrkdwn = (text: string): string =>
  text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

// mrkdwn link syntax is <url|label>, so these characters must not appear
// verbatim inside the embedded url
const encodeSlackLinkUrl = (url: string): string =>
  url.replace(/</g, '%3C').replace(/>/g, '%3E').replace(/\|/g, '%7C');

export const buildSlackRecordUnfurlAttachment = ({
  recordUrl,
  card,
}: {
  // Canonical origin + /object/<name>/<id> url from parseSlackRecordLink —
  // never the raw event url, whose query string is unbounded
  recordUrl: string;
  card: SlackRecordUnfurlCard;
}): MessageAttachment => {
  const recordTitle = escapeSlackMrkdwn(
    truncateText({ text: card.recordTitle, maxLength: TITLE_MAX_LENGTH }),
  );

  const blocks: KnownBlock[] = [
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `*<${encodeSlackLinkUrl(recordUrl)}|${recordTitle}>*`,
      },
    },
  ];

  if (card.fields.length > 0) {
    blocks.push({
      type: 'section',
      fields: card.fields.map((field) => ({
        type: 'mrkdwn' as const,
        text: `*${escapeSlackMrkdwn(field.label)}*\n${escapeSlackMrkdwn(truncateText({ text: field.value, maxLength: FIELD_VALUE_MAX_LENGTH }))}`,
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
