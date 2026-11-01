import { Blockquote } from '@/advanced-text-editor/extensions/blockquote/Blockquote';
import { getEmptyBlockHint } from '@/advanced-text-editor/utils/getEmptyBlockHint';
import { Editor } from '@tiptap/core';
import { Document } from '@tiptap/extension-document';
import { Heading } from '@tiptap/extension-heading';
import { ListKit } from '@tiptap/extension-list';
import { Paragraph } from '@tiptap/extension-paragraph';
import { Text } from '@tiptap/extension-text';
import { Placeholder } from '@tiptap/extensions/placeholder';
import { TextSelection } from '@tiptap/pm/state';

const HELLO_PARAGRAPH = {
  type: 'paragraph',
  content: [{ type: 'text', text: 'Hello' }],
};

const createEditor = (content: object[], placeholder = '') =>
  new Editor({
    extensions: [
      Document,
      Paragraph,
      Text,
      Heading.configure({ levels: [1, 2, 3] }),
      ListKit,
      Blockquote,
      Placeholder.configure({ placeholder }),
    ],
    content: { type: 'doc', content },
  });

const focusAt = (editor: Editor, pos: number) => {
  editor.view.dispatch(
    editor.state.tr.setSelection(TextSelection.create(editor.state.doc, pos)),
  );
  editor.isFocused = true;
};

describe('getEmptyBlockHint', () => {
  it('should hint an empty document even when the editor is not focused', () => {
    const editor = createEditor([{ type: 'paragraph' }]);

    expect(getEmptyBlockHint(editor)).toEqual({
      from: 0,
      to: 2,
      kind: 'text',
      headingLevel: null,
    });
    editor.destroy();
  });

  it('should leave an empty document to its custom placeholder', () => {
    const editor = createEditor([{ type: 'paragraph' }], 'Write the email');

    expect(getEmptyBlockHint(editor)).toBeNull();
    editor.destroy();
  });

  it('should hint an empty heading that its custom placeholder does not cover', () => {
    const editor = createEditor(
      [{ type: 'heading', attrs: { level: 1 } }],
      'Write the email',
    );

    expect(getEmptyBlockHint(editor)).toEqual({
      from: 0,
      to: 2,
      kind: 'heading',
      headingLevel: 1,
    });
    editor.destroy();
  });

  it('should only hint other empty blocks while the editor is focused', () => {
    const editor = createEditor([HELLO_PARAGRAPH, { type: 'paragraph' }]);

    editor.view.dispatch(
      editor.state.tr.setSelection(TextSelection.create(editor.state.doc, 8)),
    );
    expect(getEmptyBlockHint(editor)).toBeNull();

    editor.isFocused = true;
    expect(getEmptyBlockHint(editor)).toEqual({
      from: 7,
      to: 9,
      kind: 'text',
      headingLevel: null,
    });
    editor.destroy();
  });

  it('should not hint a block that has content', () => {
    const editor = createEditor([HELLO_PARAGRAPH, { type: 'paragraph' }]);

    focusAt(editor, 3);
    expect(getEmptyBlockHint(editor)).toBeNull();
    editor.destroy();
  });

  it('should name empty headings, list items and quotes', () => {
    const headingEditor = createEditor([
      HELLO_PARAGRAPH,
      { type: 'heading', attrs: { level: 2 } },
    ]);
    focusAt(headingEditor, 8);
    expect(getEmptyBlockHint(headingEditor)).toEqual({
      from: 7,
      to: 9,
      kind: 'heading',
      headingLevel: 2,
    });
    headingEditor.destroy();

    const listEditor = createEditor([
      HELLO_PARAGRAPH,
      {
        type: 'bulletList',
        content: [{ type: 'listItem', content: [{ type: 'paragraph' }] }],
      },
    ]);
    focusAt(listEditor, 10);
    expect(getEmptyBlockHint(listEditor)).toMatchObject({
      from: 9,
      to: 11,
      kind: 'listItem',
    });
    listEditor.destroy();

    const quoteEditor = createEditor([
      HELLO_PARAGRAPH,
      { type: 'blockquote', content: [{ type: 'paragraph' }] },
    ]);
    focusAt(quoteEditor, 9);
    expect(getEmptyBlockHint(quoteEditor)).toMatchObject({
      from: 8,
      to: 10,
      kind: 'blockquote',
    });
    quoteEditor.destroy();
  });
});
