import { type AdvancedTextEditorLegacyDocumentParser } from '@/advanced-text-editor/types/AdvancedTextEditorLegacyDocumentParser';
import { parseTipTapJsonDocument } from 'twenty-shared/utils';

export const withLegacyVersionlessTipTapDocuments = (
  parseLegacyDocument: AdvancedTextEditorLegacyDocumentParser,
): AdvancedTextEditorLegacyDocumentParser => {
  return (serializedDocument) => {
    const document = parseTipTapJsonDocument(serializedDocument);

    return document !== undefined && document.attrs?.schemaVersion === undefined
      ? document
      : parseLegacyDocument(serializedDocument);
  };
};
