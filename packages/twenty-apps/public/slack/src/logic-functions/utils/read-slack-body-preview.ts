import { isNonEmptyString } from '@sniptt/guards';

import { asRecord } from 'src/logic-functions/utils/as-record.util';
import { readOptionalString } from 'src/logic-functions/utils/read-optional-string.util';

const BODY_PREVIEW_MAX_LENGTH = 300;

export const readSlackBodyPreview = (
  bodyValue: unknown,
): string | undefined => {
  const markdown = readOptionalString(asRecord(bodyValue)?.markdown)?.trim();

  if (!isNonEmptyString(markdown)) {
    return undefined;
  }

  const codePoints = [...markdown];

  return codePoints.length > BODY_PREVIEW_MAX_LENGTH
    ? `${codePoints.slice(0, BODY_PREVIEW_MAX_LENGTH).join('')}…`
    : markdown;
};
