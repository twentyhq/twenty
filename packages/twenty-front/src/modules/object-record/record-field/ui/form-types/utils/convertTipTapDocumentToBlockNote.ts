import { parseTipTapJsonDocument } from 'twenty-shared/utils';

export const convertTipTapDocumentToBlockNote = (
  serializedDocument: string,
): string => {
  const document = parseTipTapJsonDocument(serializedDocument);

  return document === undefined
    ? serializedDocument
    : JSON.stringify(document.content ?? []);
};
