import { hasEditorExtension } from '@/advanced-text-editor/utils/hasEditorExtension';
import { Editor } from '@tiptap/core';
import { Bold } from '@tiptap/extension-bold';
import { Document } from '@tiptap/extension-document';
import { Paragraph } from '@tiptap/extension-paragraph';
import { Text } from '@tiptap/extension-text';

describe('hasEditorExtension', () => {
  const editor = new Editor({
    extensions: [Document, Paragraph, Text, Bold],
  });

  afterAll(() => {
    editor.destroy();
  });

  it('should return true for a loaded extension', () => {
    expect(hasEditorExtension(editor, 'bold')).toBe(true);
    expect(hasEditorExtension(editor, 'paragraph')).toBe(true);
  });

  it('should return false for an extension that is not loaded', () => {
    expect(hasEditorExtension(editor, 'italic')).toBe(false);
    expect(hasEditorExtension(editor, 'heading')).toBe(false);
  });
});
