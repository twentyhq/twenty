import { type KnownBlock, type SectionBlock } from '@slack/web-api';
import { isNonEmptyArray } from '@sniptt/guards';

import {
  type SlackRecordDetails,
  type SlackRecordField,
} from 'src/logic-functions/types/slack-record-details.type';
import { type SlackRecordReference } from 'src/logic-functions/types/slack-record-reference.type';

const RECORD_BLOCK_MAX_COUNT = 5;
const RECORD_NAME_MAX_LENGTH = 150;

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

const buildFieldText = (field: SlackRecordField): string =>
  `*${escapeSlackMrkdwn(field.label)}*\n${escapeSlackMrkdwn(field.value)}`;

// the Salesforce-unfurl look: bold linked name, object type, a muted
// label-over-value field grid, and the company logo when there is one
const buildRecordSection = (
  reference: SlackRecordReference,
  details: SlackRecordDetails,
): SectionBlock => {
  const objectLabel =
    reference.objectNameSingular.charAt(0).toUpperCase() +
    reference.objectNameSingular.slice(1);

  const linkedName = `*<${reference.recordUrl}|${escapeAndTruncate(
    reference.recordName,
    RECORD_NAME_MAX_LENGTH,
  )}>*   ·   ${escapeSlackMrkdwn(objectLabel)}`;

  return {
    type: 'section',
    text: { type: 'mrkdwn', text: linkedName },
    fields: details.fields.map((field) => ({
      type: 'mrkdwn',
      text: buildFieldText(field),
    })),
    ...(details.imageUrl !== undefined
      ? {
          accessory: {
            type: 'image',
            image_url: details.imageUrl,
            alt_text: `${reference.recordName} logo`,
          },
        }
      : {}),
  };
};

export const buildSlackRecordBlocks = ({
  references,
  detailsByRecordId,
}: {
  references: SlackRecordReference[];
  detailsByRecordId: Map<string, SlackRecordDetails>;
}): KnownBlock[] => {
  // above the cap the records are passing mentions, not the answer's
  // subject; a truncated sample would only add noise
  if (
    !isNonEmptyArray(references) ||
    references.length > RECORD_BLOCK_MAX_COUNT
  ) {
    return [];
  }

  // a record with no readable fields would only repeat the prose link,
  // so it renders nothing
  const sections = references.flatMap((reference) => {
    const details = detailsByRecordId.get(reference.recordId);

    if (details === undefined || !isNonEmptyArray(details.fields)) {
      return [];
    }

    return [buildRecordSection(reference, details)];
  });

  return sections.flatMap((section, index) =>
    index === 0 ? [section] : [{ type: 'divider' }, section],
  );
};
