import { type Editor } from '@tiptap/react';

import { serializeAdvancedTextEditorDocument } from '@/advanced-text-editor/utils/serializeAdvancedTextEditorDocument';
import { turnIntoEmptyStringIfWhitespacesOnly } from '~/utils/string/turnIntoEmptyStringIfWhitespacesOnly';

export const serializeAiChatEditorDraft = (editor: Editor) => {
  const text = turnIntoEmptyStringIfWhitespacesOnly(
    editor.getText({ blockSeparator: '\n' }),
  );

  if (text === '') {
    return '';
  }

  return serializeAdvancedTextEditorDocument(editor);
};
