import { type AdvancedTextEditorContentType } from '@/advanced-text-editor/types/AdvancedTextEditorContentType';
import { type Editor } from '@tiptap/core';

// Write-path counterpart of the contentType read path in
// useAdvancedTextEditor.
export const serializeAdvancedTextEditorContent = ({
  editor,
  contentType,
}: {
  editor: Editor;
  contentType: AdvancedTextEditorContentType;
}): string => {
  if (contentType === 'html' || contentType === 'markdown') {
    return editor.getHTML();
  }

  return JSON.stringify(editor.getJSON());
};
