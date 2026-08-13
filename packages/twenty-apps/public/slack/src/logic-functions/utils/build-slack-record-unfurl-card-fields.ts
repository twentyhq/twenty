import { isNonEmptyString } from '@sniptt/guards';

import { type SlackRecordUnfurlCardField } from 'src/logic-functions/types/slack-record-unfurl-card.type';

const MAX_CARD_FIELDS = 4;

export const buildSlackRecordUnfurlCardFields = (
  candidateFields: [string, string | null | undefined][],
): SlackRecordUnfurlCardField[] =>
  candidateFields
    .filter((candidateField): candidateField is [string, string] =>
      isNonEmptyString(candidateField[1]),
    )
    .slice(0, MAX_CARD_FIELDS)
    .map(([label, value]) => ({ label, value }));
