import { isNonEmptyString } from '@sniptt/guards';
import {
  convertBlockNoteToRichTextDocument,
  convertTipTapBlocksToDocument,
  isDefined,
} from 'twenty-shared/utils';

import { type FieldRichTextValue } from '@/object-record/record-field/ui/types/FieldMetadata';

export const getRichTextFieldSerializedContent = (
  fieldValue: FieldRichTextValue | null | undefined,
): string | undefined => {
  if (isNonEmptyString(fieldValue?.tiptap)) {
    return fieldValue.tiptap;
  }

  const legacyDocument = isNonEmptyString(fieldValue?.blocknote)
    ? (convertTipTapBlocksToDocument(fieldValue.blocknote) ??
      convertBlockNoteToRichTextDocument(fieldValue.blocknote))
    : undefined;

  if (isDefined(legacyDocument)) {
    return JSON.stringify(legacyDocument);
  }

  return isNonEmptyString(fieldValue?.markdown)
    ? fieldValue.markdown
    : undefined;
};
