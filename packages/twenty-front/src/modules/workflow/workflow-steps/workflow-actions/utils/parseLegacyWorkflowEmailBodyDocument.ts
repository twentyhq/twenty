import { type AdvancedTextEditorLegacyDocumentParser } from '@/advanced-text-editor/types/AdvancedTextEditorLegacyDocumentParser';
import { parseLegacyHtmlOrPlainTextDocument } from '@/advanced-text-editor/utils/parseLegacyHtmlOrPlainTextDocument';
import { parseTipTapJsonDocument } from 'twenty-shared/utils';

export const parseLegacyWorkflowEmailBodyDocument: AdvancedTextEditorLegacyDocumentParser =
  (serializedDocument) => {
    const document = parseTipTapJsonDocument(serializedDocument);

    if (document !== undefined && document.attrs?.schemaVersion === undefined) {
      return document;
    }

    return parseLegacyHtmlOrPlainTextDocument(serializedDocument);
  };
