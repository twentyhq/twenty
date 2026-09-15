import { isUndefined } from '@sniptt/guards';

import { asRecord } from 'src/logic-functions/utils/as-record.util';
import { getString } from 'src/logic-functions/utils/get-string.util';

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
