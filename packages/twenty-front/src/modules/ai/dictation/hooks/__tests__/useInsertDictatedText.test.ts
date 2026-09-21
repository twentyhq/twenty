import { renderHook } from '@testing-library/react';
import { Editor } from '@tiptap/core';
import { Bold } from '@tiptap/extension-bold';
import { Document } from '@tiptap/extension-document';
import { Italic } from '@tiptap/extension-italic';
import { Paragraph } from '@tiptap/extension-paragraph';
import { Text } from '@tiptap/extension-text';

import { useInsertDictatedText } from '@/ai/dictation/hooks/useInsertDictatedText';

const renderInsert = (editor: Editor | null) =>
  renderHook(() => useInsertDictatedText(editor)).result.current;

describe('useInsertDictatedText', () => {
  let editor: Editor;

  beforeEach(() => {
    // The composer's schema carries marks, which is what makes a bare string
    // insertion parse as HTML rather than land literally.
    editor = new Editor({
      extensions: [Document, Paragraph, Text, Bold, Italic],
      content: '<p></p>',
    });
  });

  afterEach(() => {
    editor?.destroy();
  });

  it('should write what was said rather than parsing it as markup', () => {
    renderInsert(editor)('wrap it in <b>bold</b> and AT&T');

    expect(editor.getText()).toBe('wrap it in <b>bold</b> and AT&T');
  });

  it('should separate an utterance from the words already there', () => {
    const insert = renderInsert(editor);

    insert('hello');
    insert('world');

    expect(editor.getText()).toBe('hello world');
  });

  it('should not open an empty composer with a space', () => {
    renderInsert(editor)('hello');

    expect(editor.getText()).toBe('hello');
  });

  it('should not double the space the speaker already left', () => {
    editor.commands.insertContent('hello ');

    renderInsert(editor)('world');

    expect(editor.getText()).toBe('hello world');
  });
});
