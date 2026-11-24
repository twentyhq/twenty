import { type AdvancedTextEditorLegacyDocumentParser } from '@/advanced-text-editor/types/AdvancedTextEditorLegacyDocumentParser';
import { getInitialEditorContent } from '@/advanced-text-editor/utils/getInitialEditorContent';
import { type JSONContent } from '@tiptap/core';
import { parseEmailDocument, parseJson } from 'twenty-shared/utils';

// Documents saved without attrs.schemaVersion are version 1, as on the server
export const parseUnversionedEmailBodyDocument: AdvancedTextEditorLegacyDocumentParser =
  (serializedDocument) => {
    const parseResult = parseEmailDocument(
      parseJson<unknown>(serializedDocument),
    );

    return parseResult.success
      ? (parseResult.document as JSONContent)
      : getInitialEditorContent('');
  };
