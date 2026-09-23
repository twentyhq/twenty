import { isDefined, parseTipTapJsonDocument } from 'twenty-shared/utils';

export const serializeTipTapDocumentContent = (
  serializedDocument: string,
): string => {
  const document = parseTipTapJsonDocument(serializedDocument);

  return !isDefined(document)
    ? serializedDocument
    : JSON.stringify(document.content ?? []);
};
