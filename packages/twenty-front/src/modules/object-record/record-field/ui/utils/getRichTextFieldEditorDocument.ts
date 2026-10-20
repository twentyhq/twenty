import { isNonEmptyString } from '@sniptt/guards';
import {
  convertBlockNoteToTipTapDocument,
  isDefined,
} from 'twenty-shared/utils';

import { type FieldRichTextValue } from '@/object-record/record-field/ui/types/FieldMetadata';

export const getRichTextFieldEditorDocument = (
  fieldValue: FieldRichTextValue | null | undefined,
): string | undefined => {
  if (isNonEmptyString(fieldValue?.tiptap)) {
    return fieldValue.tiptap;
  }

  const blockNoteDocument = isNonEmptyString(fieldValue?.blocknote)
    ? convertBlockNoteToTipTapDocument(fieldValue.blocknote)
    : undefined;

  if (isDefined(blockNoteDocument)) {
    return JSON.stringify(blockNoteDocument);
  }

  return isNonEmptyString(fieldValue?.markdown)
    ? fieldValue.markdown
    : undefined;
};
