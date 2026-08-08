import { type CardBlock, type KnownBlock } from '@slack/web-api';
import { isNonEmptyArray } from '@sniptt/guards';

import { type SlackRecordReference } from 'src/logic-functions/types/slack-record-reference.type';

// Slack card limits: title and subtitle 150 chars, body 200 chars
const CARD_TITLE_MAX_LENGTH = 150;
const CARD_BODY_MAX_LENGTH = 200;
const RECORD_CARD_MAX_COUNT = 5;

const ELLIPSIS = '…';

const escapeSlackMrkdwn = (text: string): string =>
  text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

// truncates the raw text so the escaped result fits the limit without
// splitting an &amp;-style entity or a surrogate pair
const escapeAndTruncate = (rawText: string, maxLength: number): string => {
  const escaped = escapeSlackMrkdwn(rawText);

  if (escaped.length <= maxLength) {
    return escaped;
  }

  const codePoints = [...rawText];

  for (let end = codePoints.length - 1; end > 0; end--) {
    const candidate =
      escapeSlackMrkdwn(codePoints.slice(0, end).join('')) + ELLIPSIS;

    if (candidate.length <= maxLength) {
      return candidate;
    }
  }

  return ELLIPSIS;
};

const buildRecordCard = (
  reference: SlackRecordReference,
  fieldLines: string[] | undefined,
): CardBlock => {
  const objectLabel =
    reference.objectNameSingular.charAt(0).toUpperCase() +
    reference.objectNameSingular.slice(1);

  return {
    type: 'card',
    title: {
      type: 'mrkdwn',
      text: escapeAndTruncate(reference.recordName, CARD_TITLE_MAX_LENGTH),
    },
    subtitle: { type: 'mrkdwn', text: escapeSlackMrkdwn(objectLabel) },
    ...(isNonEmptyArray(fieldLines)
      ? {
          body: {
            type: 'mrkdwn',
            text: escapeAndTruncate(fieldLines.join('\n'), CARD_BODY_MAX_LENGTH),
          },
        }
      : {}),
    actions: [
      {
        type: 'button',
        text: { type: 'plain_text', text: 'Open in Twenty' },
        url: reference.recordUrl,
      },
    ],
  };
};

export const buildSlackRecordCardBlocks = ({
  references,
  fieldLinesByRecordId,
}: {
  references: SlackRecordReference[];
  fieldLinesByRecordId: Map<string, string[]>;
}): KnownBlock[] => {
  // above the cap the records are passing mentions, not the answer's
  // subject; a truncated sample of cards would only add noise
  if (
    !isNonEmptyArray(references) ||
    references.length > RECORD_CARD_MAX_COUNT
  ) {
    return [];
  }

  const cards = references.map((reference) =>
    buildRecordCard(reference, fieldLinesByRecordId.get(reference.recordId)),
  );

  return cards.length === 1 ? cards : [{ type: 'carousel', elements: cards }];
};
