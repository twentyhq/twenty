import { parseTipTapJsonDocument } from 'twenty-shared/utils';

export const serializeTipTapDocumentContent = (
  serializedDocument: string,
): string => {
  const document = parseTipTapJsonDocument(serializedDocument);

  return document === undefined
    ? serializedDocument
    : JSON.stringify(document.content ?? []);
};
