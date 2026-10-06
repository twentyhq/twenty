import { type AdvancedTextEditorLegacyDocumentParser } from '@/advanced-text-editor/types/AdvancedTextEditorLegacyDocumentParser';
import { getInitialEditorContent } from '@/advanced-text-editor/utils/getInitialEditorContent';
import { type JSONContent } from '@tiptap/core';
import {
  convertEmailBodyToEmailDocument,
  parseTipTapJsonDocument,
} from 'twenty-shared/utils';

export const parseLegacyWorkflowEmailBodyDocument: AdvancedTextEditorLegacyDocumentParser =
  (serializedDocument) => {
    const conversionResult =
      convertEmailBodyToEmailDocument(serializedDocument);

    if (conversionResult.success) {
      return conversionResult.document as JSONContent;
    }

    return (
      parseTipTapJsonDocument(serializedDocument) ?? getInitialEditorContent('')
    );
  };
