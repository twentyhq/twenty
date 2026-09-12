import { isNonEmptyString } from '@sniptt/guards';

import { asRecord } from 'src/logic-functions/utils/as-record.util';
import { readOptionalString } from 'src/logic-functions/utils/read-optional-string.util';

const BODY_PREVIEW_MAX_LENGTH = 300;

const GRAPHEME_SEGMENTER = new Intl.Segmenter(undefined, {
  granularity: 'grapheme',
});

export const readSlackBodyPreview = ({
  bodyValue,
  maxLength = BODY_PREVIEW_MAX_LENGTH,
}: {
  bodyValue: unknown;
  maxLength?: number;
}): string | undefined => {
  const markdown = readOptionalString(asRecord(bodyValue)?.markdown)?.trim();

  if (!isNonEmptyString(markdown)) {
    return undefined;
  }

  if (markdown.length <= maxLength) {
    return markdown;
  }

  // Slack counts the characters it stores, so the budget is code units, cut on
  // grapheme boundaries to keep sequences such as 👨‍👩‍👧‍👦 whole
  const truncated = [...GRAPHEME_SEGMENTER.segment(markdown)]
    .filter(({ index, segment }) => index + segment.length <= maxLength - 1)
    .map(({ segment }) => segment)
    .join('');

  return `${truncated}…`;
};
