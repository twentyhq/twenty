import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { act, renderHook } from '@testing-library/react';
import { Editor } from '@tiptap/core';
import { Document } from '@tiptap/extension-document';
import { Heading } from '@tiptap/extension-heading';
import { Paragraph } from '@tiptap/extension-paragraph';
import { Text } from '@tiptap/extension-text';

import { Blockquote } from '@/advanced-text-editor/extensions/blockquote/Blockquote';
import { useTurnIntoBlockOptions } from '@/advanced-text-editor/hooks/useTurnIntoBlockOptions';
import { getTurnIntoSelection } from '@/advanced-text-editor/utils/getTurnIntoSelection';

const paragraph = (text: string) => ({
  type: 'paragraph',
  content: [{ type: 'text', text }],
});

const heading = (text: string) => ({
  type: 'heading',
  attrs: { level: 1 },
  content: [{ type: 'text', text }],
});

const createEditor = (content: object[]) =>
  new Editor({
    extensions: [Document, Paragraph, Text, Heading, Blockquote],
    content: { type: 'doc', content },
  });

const turnBlockInto = ({
  editor,
  blockPos,
  optionId,
}: {
  editor: Editor;
  blockPos: number;
  optionId: string;
}) => {
  editor.view.dispatch(
    editor.state.tr.setSelection(
      getTurnIntoSelection({ doc: editor.state.doc, blockPos }),
    ),
  );

  const { result } = renderHook(() => useTurnIntoBlockOptions(editor), {
    wrapper: ({ children }) => I18nProvider({ i18n, children }),
  });

  act(() => {
    result.current.find(({ id }) => id === optionId)?.onClick();
  });
};

describe('useTurnIntoBlockOptions', () => {
  it('should turn every paragraph of a quote into text', () => {
    const editor = createEditor([
      {
        type: 'blockquote',
        content: [paragraph('First'), paragraph('Second')],
      },
    ]);

    turnBlockInto({ editor, blockPos: 0, optionId: 'paragraph' });

    expect(editor.getJSON().content).toEqual([
      paragraph('First'),
      paragraph('Second'),
    ]);

    editor.destroy();
  });

  it('should turn every paragraph of a quote into a heading', () => {
    const editor = createEditor([
      {
        type: 'blockquote',
        content: [paragraph('First'), paragraph('Second')],
      },
    ]);

    turnBlockInto({ editor, blockPos: 0, optionId: 'heading1' });

    expect(editor.getJSON().content).toEqual([
      heading('First'),
      heading('Second'),
    ]);

    editor.destroy();
  });

  it('should turn a paragraph into a quote', () => {
    const editor = createEditor([paragraph('First'), paragraph('Second')]);

    turnBlockInto({ editor, blockPos: 0, optionId: 'blockquote' });

    expect(editor.getJSON().content).toEqual([
      { type: 'blockquote', content: [paragraph('First')] },
      paragraph('Second'),
    ]);

    editor.destroy();
  });
});
