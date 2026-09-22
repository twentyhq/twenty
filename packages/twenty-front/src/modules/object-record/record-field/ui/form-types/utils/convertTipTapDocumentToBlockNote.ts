import { convertTipTapToBlockNote } from '@/object-record/record-field/ui/form-types/utils/convertTipTapToBlockNote';
import { parseTipTapJsonDocument } from 'twenty-shared/utils';

export const convertTipTapDocumentToBlockNote = (
  serializedDocument: string,
  preserveVariableTags = false,
): string => {
  const document = parseTipTapJsonDocument(serializedDocument);

  return document === undefined
    ? serializedDocument
    : JSON.stringify(
        preserveVariableTags
          ? (document.content ?? [])
          : convertTipTapToBlockNote(document.content ?? []),
      );
};
