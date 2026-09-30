import { type AdvancedTextEditorLegacyDocumentParser } from '@/advanced-text-editor/types/AdvancedTextEditorLegacyDocumentParser';
import { getInitialEditorContent } from '@/advanced-text-editor/utils/getInitialEditorContent';
import { type JSONContent } from '@tiptap/core';
import {
  parseEmailBodyAsEmailDocument,
  parseTipTapJsonDocument,
} from 'twenty-shared/utils';

export const parseLegacyWorkflowEmailBodyDocument: AdvancedTextEditorLegacyDocumentParser =
  (serializedDocument) => {
    const parseResult = parseEmailBodyAsEmailDocument(serializedDocument);

    if (parseResult.success) {
      return parseResult.document as JSONContent;
    }

    return (
      parseTipTapJsonDocument(serializedDocument) ?? getInitialEditorContent('')
    );
  };
