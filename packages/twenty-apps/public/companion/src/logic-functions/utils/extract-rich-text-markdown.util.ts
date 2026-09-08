import { isUndefined } from '@sniptt/guards';

import { asRecord } from '@twentyhq/recall-utils/utils/as-record.util';
import { getString } from '@twentyhq/recall-utils/utils/get-string.util';

export const extractRichTextMarkdown = (
  rawValue: string,
): string | undefined => {
  try {
    const richTextValue = asRecord(JSON.parse(rawValue));

    if (isUndefined(richTextValue)) {
      return getString(rawValue);
    }

    return getString(richTextValue.markdown);
  } catch {
    return getString(rawValue);
  }
};
