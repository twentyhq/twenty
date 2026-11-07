import {
  isDefined,
  parseTipTapJsonDocument,
  TIPTAP_DOCUMENT_SCHEMA_VERSION,
} from 'twenty-shared/utils';

export const ensureTipTapSchemaVersion = (tiptap: string): string => {
  const document = parseTipTapJsonDocument(tiptap);

  if (!isDefined(document) || isDefined(document.attrs?.schemaVersion)) {
    return tiptap;
  }

  return JSON.stringify({
    ...document,
    attrs: { ...document.attrs, schemaVersion: TIPTAP_DOCUMENT_SCHEMA_VERSION },
  });
};
