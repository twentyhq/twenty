import { convertTipTapToBlockNote } from '@/object-record/record-field/ui/form-types/utils/convertTipTapToBlockNote';
import { isDefined, parseTipTapJsonDocument } from 'twenty-shared/utils';

export const convertTipTapDocumentToBlockNote = (
  serializedDocument: string,
): string => {
  const document = parseTipTapJsonDocument(serializedDocument);

  return !isDefined(document)
    ? serializedDocument
    : JSON.stringify(convertTipTapToBlockNote(document.content ?? []));
};
