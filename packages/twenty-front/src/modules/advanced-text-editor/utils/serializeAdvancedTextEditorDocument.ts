import { type Editor } from '@tiptap/core';
import { TIPTAP_DOCUMENT_SCHEMA_VERSION } from 'twenty-shared/utils';

export const serializeAdvancedTextEditorDocument = (editor: Editor): string => {
  const document = editor.getJSON();

  return JSON.stringify({
    ...document,
    attrs: {
      ...document.attrs,
      schemaVersion: TIPTAP_DOCUMENT_SCHEMA_VERSION,
    },
  });
};
