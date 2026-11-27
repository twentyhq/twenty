import { isPlainObject } from 'twenty-shared/utils';

import { transformRichTextValue } from 'src/engine/core-modules/record-transformer/utils/transform-rich-text.util';

const RICH_TEXT_BODY_SUB_FIELD_NAMES = ['tiptap', 'blocknote', 'markdown'];

export const transformRichTextFieldValue = (richTextFieldValue: unknown) => {
  if (
    !isPlainObject(richTextFieldValue) ||
    richTextFieldValue.files === undefined
  ) {
    return transformRichTextValue(richTextFieldValue);
  }

  // A value listing only files leaves the stored body untouched.
  const isBodyProvided = RICH_TEXT_BODY_SUB_FIELD_NAMES.some(
    (subFieldName) => richTextFieldValue[subFieldName] !== undefined,
  );

  return {
    ...(isBodyProvided ? transformRichTextValue(richTextFieldValue) : {}),
    files: richTextFieldValue.files,
  };
};
