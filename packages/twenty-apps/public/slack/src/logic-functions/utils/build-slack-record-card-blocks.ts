import { type CardBlock, type KnownBlock } from '@slack/web-api';
import { isNonEmptyArray } from '@sniptt/guards';

import { type SlackRecordReference } from 'src/logic-functions/types/slack-record-reference.type';

// Slack card limits: title and subtitle 150 chars, body 200 chars
const CARD_TITLE_MAX_LENGTH = 150;
const CARD_BODY_MAX_LENGTH = 200;
const RECORD_CARD_MAX_COUNT = 5;

const escapeSlackMrkdwn = (text: string): string =>
  text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const truncate = (text: string, maxLength: number): string =>
  text.length <= maxLength ? text : `${text.slice(0, maxLength - 1)}…`;

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
      text: truncate(escapeSlackMrkdwn(reference.recordName), CARD_TITLE_MAX_LENGTH),
    },
    subtitle: { type: 'mrkdwn', text: escapeSlackMrkdwn(objectLabel) },
    ...(isNonEmptyArray(fieldLines)
      ? {
          body: {
            type: 'mrkdwn',
            text: truncate(
              fieldLines.map(escapeSlackMrkdwn).join('\n'),
              CARD_BODY_MAX_LENGTH,
            ),
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
  if (references.length === 0) {
    return [];
  }

  const cards = references
    .slice(0, RECORD_CARD_MAX_COUNT)
    .map((reference) =>
      buildRecordCard(reference, fieldLinesByRecordId.get(reference.recordId)),
    );

  return cards.length === 1 ? cards : [{ type: 'carousel', elements: cards }];
};
