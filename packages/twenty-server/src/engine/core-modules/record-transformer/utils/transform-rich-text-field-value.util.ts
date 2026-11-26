import { isPlainObject } from 'twenty-shared/utils';

import { transformRichTextValue } from 'src/engine/core-modules/record-transformer/utils/transform-rich-text.util';

export const transformRichTextFieldValue = (richTextFieldValue: unknown) => {
  const transformedRichTextValue = transformRichTextValue(richTextFieldValue);

  return isPlainObject(richTextFieldValue) &&
    richTextFieldValue.files !== undefined
    ? { ...transformedRichTextValue, files: richTextFieldValue.files }
    : transformedRichTextValue;
};
