import { type JSONContent } from '@tiptap/core';
import { TIPTAP_DOCUMENT_SCHEMA_VERSION } from 'twenty-shared/utils';

export const serializeJsonContentAsAdvancedTextEditorDocument = (
  document: JSONContent,
): string =>
  JSON.stringify({
    ...document,
    attrs: {
      ...document.attrs,
      schemaVersion: TIPTAP_DOCUMENT_SCHEMA_VERSION,
    },
  });
