import { Blockquote } from '@/advanced-text-editor/extensions/blockquote/Blockquote';
import { getPositionAfterCurrentBlock } from '@/advanced-text-editor/utils/getPositionAfterCurrentBlock';
import { Editor } from '@tiptap/core';
import { Document } from '@tiptap/extension-document';
import { Heading } from '@tiptap/extension-heading';
import { ListKit } from '@tiptap/extension-list';
import { Paragraph } from '@tiptap/extension-paragraph';
import { Text } from '@tiptap/extension-text';
import { TextSelection } from '@tiptap/pm/state';

const paragraph = (text?: string) => ({
  type: 'paragraph',
  ...(text ? { content: [{ type: 'text', text }] } : {}),
});

const HEADING = {
  type: 'heading',
  attrs: { level: 2 },
  content: [{ type: 'text', text: 'New' }],
};

const insertHeadingAfterCursor = (content: object[], cursor: number) => {
  const editor = new Editor({
    extensions: [
      Document,
      Paragraph,
      Text,
      Heading.configure({ levels: [1, 2, 3] }),
      ListKit,
      Blockquote,
    ],
    content: { type: 'doc', content },
  });

  editor.view.dispatch(
    editor.state.tr.setSelection(
      TextSelection.create(editor.state.doc, cursor),
    ),
  );
  editor.commands.insertContentAt(
    getPositionAfterCurrentBlock(editor.state),
    HEADING,
  );

  const topLevelTypes = (editor.getJSON().content ?? []).map(
    (node) => node.type,
  );

  editor.destroy();

  return topLevelTypes;
};

describe('getPositionAfterCurrentBlock', () => {
  it.each([
    {
      case: 'keeps an empty block instead of replacing it',
      content: [paragraph('Hello'), paragraph()],
      cursor: 8,
      expected: ['paragraph', 'paragraph', 'heading'],
    },
    {
      case: 'does not split the block around the cursor',
      content: [paragraph('Hello'), paragraph('World')],
      cursor: 3,
      expected: ['paragraph', 'heading', 'paragraph'],
    },
    {
      case: 'adds the block after a list instead of inside it',
      content: [
        {
          type: 'bulletList',
          content: [{ type: 'listItem', content: [paragraph('Item')] }],
        },
        paragraph('After'),
      ],
      cursor: 4,
      expected: ['bulletList', 'heading', 'paragraph'],
    },
    {
      case: 'adds the block after a quote instead of inside it',
      content: [
        { type: 'blockquote', content: [paragraph('Quote')] },
        paragraph('After'),
      ],
      cursor: 3,
      expected: ['blockquote', 'heading', 'paragraph'],
    },
  ])('$case', ({ content, cursor, expected }) => {
    expect(insertHeadingAfterCursor(content, cursor)).toEqual(expected);
  });
});
