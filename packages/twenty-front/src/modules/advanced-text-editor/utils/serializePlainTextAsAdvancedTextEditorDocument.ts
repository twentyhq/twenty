import { parseLegacyPlainTextDocument } from '@/advanced-text-editor/utils/parseLegacyPlainTextDocument';
import { serializeJsonContentAsAdvancedTextEditorDocument } from '@/advanced-text-editor/utils/serializeJsonContentAsAdvancedTextEditorDocument';

export const serializePlainTextAsAdvancedTextEditorDocument = (
  text: string,
): string =>
  serializeJsonContentAsAdvancedTextEditorDocument(
    parseLegacyPlainTextDocument(text),
  );
