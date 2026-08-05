import { type AdvancedTextEditorLegacyDocumentParser } from '@/advanced-text-editor/types/AdvancedTextEditorLegacyDocumentParser';
import { getInitialEditorContent } from '@/advanced-text-editor/utils/getInitialEditorContent';
import { type Content } from '@tiptap/core';
import { parseCanonicalTipTapJsonDocument } from 'twenty-shared/utils';

export const deserializeAdvancedTextEditorDocument = ({
  serializedDocument,
  parseLegacyDocument,
}: {
  serializedDocument: string;
  parseLegacyDocument?: AdvancedTextEditorLegacyDocumentParser;
}): Content => {
  if (serializedDocument.trim() === '') {
    return getInitialEditorContent('');
  }

  const document = parseCanonicalTipTapJsonDocument(serializedDocument);

  if (document !== undefined) {
    return document;
  }

  return (
    parseLegacyDocument?.(serializedDocument) ?? getInitialEditorContent('')
  );
};
