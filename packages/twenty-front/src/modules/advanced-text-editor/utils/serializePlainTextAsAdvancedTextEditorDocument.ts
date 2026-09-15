import { parseLegacyPlainTextDocument } from '@/advanced-text-editor/utils/parseLegacyPlainTextDocument';
import { TIPTAP_DOCUMENT_SCHEMA_VERSION } from 'twenty-shared/utils';

export const serializePlainTextAsAdvancedTextEditorDocument = (
  text: string,
): string =>
  JSON.stringify({
    ...parseLegacyPlainTextDocument(text),
    attrs: { schemaVersion: TIPTAP_DOCUMENT_SCHEMA_VERSION },
  });
