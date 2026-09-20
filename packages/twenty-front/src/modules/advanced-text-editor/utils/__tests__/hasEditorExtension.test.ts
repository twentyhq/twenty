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

  it('should return false for a destroyed editor', () => {
    const destroyedEditor = new Editor({
      extensions: [Document, Paragraph, Text, Bold],
    });

    destroyedEditor.destroy();

    expect(hasEditorExtension(destroyedEditor, 'bold')).toBe(false);
  });

  it('should return false when the editor is null or undefined', () => {
    expect(hasEditorExtension(null, 'bold')).toBe(false);
    expect(hasEditorExtension(undefined, 'bold')).toBe(false);
  });

  it('should return false when the extension manager is missing', () => {
    const editorWithoutExtensionManager = {
      extensionManager: null,
    } as unknown as Editor;

    expect(hasEditorExtension(editorWithoutExtensionManager, 'bold')).toBe(
      false,
    );
  });

  it('should return false when the extensions are not an array', () => {
    const editorWithInvalidExtensions = {
      extensionManager: { extensions: null },
    } as unknown as Editor;

    expect(hasEditorExtension(editorWithInvalidExtensions, 'bold')).toBe(false);
  });
});
