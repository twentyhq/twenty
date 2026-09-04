import { isNonEmptyString } from '@sniptt/guards';

import { asRecord } from 'src/logic-functions/utils/as-record.util';
import { readOptionalString } from 'src/logic-functions/utils/read-optional-string.util';

const BODY_PREVIEW_MAX_LENGTH = 300;

// cutting by code point splits ZWJ sequences such as 👨‍👩‍👧‍👦 mid-cluster
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

  const graphemes = [...GRAPHEME_SEGMENTER.segment(markdown)];

  if (graphemes.length <= maxLength) {
    return markdown;
  }

  const truncated = graphemes
    .slice(0, maxLength - 1)
    .map(({ segment }) => segment)
    .join('');

  return `${truncated}…`;
};
