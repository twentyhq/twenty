import { type AdvancedTextEditorLegacyDocumentParser } from '@/advanced-text-editor/types/AdvancedTextEditorLegacyDocumentParser';
import { getInitialEditorContent } from '@/advanced-text-editor/utils/getInitialEditorContent';
import { parseTipTapJsonDocument } from 'twenty-shared/utils';

export const parseLegacyWorkflowEmailBodyDocument: AdvancedTextEditorLegacyDocumentParser =
  (serializedDocument) =>
    parseTipTapJsonDocument(serializedDocument) ?? getInitialEditorContent('');
