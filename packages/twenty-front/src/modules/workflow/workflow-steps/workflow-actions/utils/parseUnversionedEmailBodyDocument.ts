import { type AdvancedTextEditorLegacyDocumentParser } from '@/advanced-text-editor/types/AdvancedTextEditorLegacyDocumentParser';
import { getInitialEditorContent } from '@/advanced-text-editor/utils/getInitialEditorContent';
import { type JSONContent } from '@tiptap/core';
import {
  EMAIL_DOCUMENT_SCHEMA_VERSION,
  parseEmailDocument,
  parseJson,
} from 'twenty-shared/utils';

// The server accepts and sends email documents without attrs.schemaVersion as version 1
export const parseUnversionedEmailBodyDocument: AdvancedTextEditorLegacyDocumentParser =
  (serializedDocument) => {
    const parseResult = parseEmailDocument(
      parseJson<unknown>(serializedDocument),
    );

    if (!parseResult.success) {
      return getInitialEditorContent('');
    }

    return {
      ...parseResult.document,
      attrs: {
        ...parseResult.document.attrs,
        schemaVersion: EMAIL_DOCUMENT_SCHEMA_VERSION,
      },
    } as JSONContent;
  };
