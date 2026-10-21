import { type Editor } from '@tiptap/core';

import { serializeJsonContentAsAdvancedTextEditorDocument } from '@/advanced-text-editor/utils/serializeJsonContentAsAdvancedTextEditorDocument';

export const serializeAdvancedTextEditorDocument = (editor: Editor): string =>
  serializeJsonContentAsAdvancedTextEditorDocument(editor.getJSON());
