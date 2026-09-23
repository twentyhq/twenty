import { isNonEmptyString } from '@sniptt/guards';

import { asRecord } from 'src/logic-functions/utils/as-record.util';
import { readOptionalString } from 'src/logic-functions/utils/read-optional-string.util';
import { truncateOnGraphemeBoundary } from 'src/logic-functions/utils/truncate-on-grapheme-boundary';

const BODY_PREVIEW_MAX_LENGTH = 300;

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

  return `${truncateOnGraphemeBoundary({ text: markdown, maxLength: maxLength - 1 })}…`;
};
