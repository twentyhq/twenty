import { Editor, type JSONContent } from '@tiptap/core';

import { type AdvancedTextEditorProfile } from '@/advanced-text-editor/types/AdvancedTextEditorProfile';
import { buildAdvancedTextEditorExtensions } from '@/advanced-text-editor/utils/buildAdvancedTextEditorExtensions';
import { buildRecordRichTextExtensions } from '@/advanced-text-editor/utils/buildRecordRichTextExtensions';

jest.mock('@tiptap/react', () => ({
  ...jest.requireActual('@tiptap/react'),
  ReactNodeViewRenderer: () => () => ({}),
}));

const createEditor = (content: JSONContent[]) =>
  new Editor({
    element: document.createElement('div'),
    extensions: buildAdvancedTextEditorExtensions({
      profile: {
        chrome: 'document',
        variant: 'app',
        minHeight: 0,
        enableFullScreen: false,
        buildExtensions: buildRecordRichTextExtensions,
      } satisfies AdvancedTextEditorProfile,
      context: {},
      placeholder: undefined,
      readonly: false,
    }),
    content: { type: 'doc', content },
  });

const paragraph = (text: string): JSONContent => ({
  type: 'paragraph',
  content: [{ type: 'text', text }],
});

const listItem = (text: string): JSONContent => ({
  type: 'listItem',
  content: [paragraph(text)],
});

const getIndents = (editor: Editor) =>
  editor.getJSON().content?.map(({ attrs }) => attrs?.indent);

describe('Indent', () => {
  it('indents a paragraph with Tab and outdents it with Shift-Tab or Backspace at its start', () => {
    const editor = createEditor([paragraph('Intro'), paragraph('Detail')]);

    editor.commands.setTextSelection(9);
    editor.commands.keyboardShortcut('Tab');
    editor.commands.keyboardShortcut('Tab');

    expect(getIndents(editor)).toEqual([0, 2]);
    expect(
      editor.view.dom.querySelector('[data-indent="2"]')?.textContent,
    ).toBe('Detail');

    editor.commands.keyboardShortcut('Shift-Tab');

    expect(getIndents(editor)).toEqual([0, 1]);

    editor.commands.setTextSelection(8);
    editor.commands.keyboardShortcut('Backspace');

    expect(getIndents(editor)).toEqual([0, 0]);
  });

  it('nests a list item with Tab instead of indenting the whole list', () => {
    const editor = createEditor([
      { type: 'bulletList', content: [listItem('One'), listItem('Two')] },
    ]);

    editor.commands.setTextSelection(10);
    editor.commands.keyboardShortcut('Tab');

    const [list]: JSONContent[] = editor.getJSON().content ?? [];
    const [firstItem]: JSONContent[] = list.content ?? [];

    expect(list.attrs?.indent).toBe(0);
    expect(list.content).toHaveLength(1);
    expect(firstItem.content?.map((child) => child.type)).toEqual([
      'paragraph',
      'bulletList',
    ]);
  });
});
