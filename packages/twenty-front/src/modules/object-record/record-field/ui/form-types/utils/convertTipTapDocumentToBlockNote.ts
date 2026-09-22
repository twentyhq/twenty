import { convertTipTapToBlockNote } from '@/object-record/record-field/ui/form-types/utils/convertRecordRichText';
import { parseTipTapJsonDocument } from 'twenty-shared/utils';

export const convertTipTapDocumentToBlockNote = (
  serializedDocument: string,
): string => {
  const document = parseTipTapJsonDocument(serializedDocument);

  return document === undefined
    ? serializedDocument
    : JSON.stringify(convertTipTapToBlockNote(document.content ?? []));
};
