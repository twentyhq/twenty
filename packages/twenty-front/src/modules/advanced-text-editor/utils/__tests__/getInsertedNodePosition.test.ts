import { getInsertedNodePosition } from '@/advanced-text-editor/utils/getInsertedNodePosition';
import { Editor, Node } from '@tiptap/core';
import { Document } from '@tiptap/extension-document';
import { Paragraph } from '@tiptap/extension-paragraph';
import { Text } from '@tiptap/extension-text';
import { UndoRedo } from '@tiptap/extensions';

const HtmlBlock = Node.create({
  name: 'html',
  group: 'block',
  atom: true,
  parseHTML: () => [{ tag: 'div[data-html]' }],
  renderHTML: () => ['div', { 'data-html': '' }],
});

const HELLO_PARAGRAPH = {
  type: 'paragraph',
  content: [{ type: 'text', text: 'Hello' }],
};

const createEditor = (content: object[]) =>
  new Editor({
    extensions: [Document, Paragraph, Text, HtmlBlock, UndoRedo],
    content: { type: 'doc', content },
  });

const recordInsertedHtmlPositions = (editor: Editor) => {
  const positions: (number | null)[] = [];

  editor.on('transaction', ({ transaction }) => {
    positions.push(
      getInsertedNodePosition({ transaction, nodeTypeName: 'html' }),
    );
  });

  return positions;
};

describe('getInsertedNodePosition', () => {
  it('should return the position of a newly inserted node', () => {
    const editor = createEditor([HELLO_PARAGRAPH]);
    const positions = recordInsertedHtmlPositions(editor);

    editor.commands.insertContentAt(7, { type: 'html' });

    expect(positions).toEqual([7]);
    editor.destroy();
  });

  it('should ignore a node that is moved', () => {
    const editor = createEditor([{ type: 'html' }, HELLO_PARAGRAPH]);
    const positions = recordInsertedHtmlPositions(editor);
    const htmlNode = editor.state.doc.child(0);

    editor.view.dispatch(editor.state.tr.delete(0, 1).insert(7, htmlNode));

    expect(positions).toEqual([null]);
    editor.destroy();
  });

  it('should ignore a node restored by undo', () => {
    const editor = createEditor([{ type: 'html' }, HELLO_PARAGRAPH]);

    editor.commands.deleteRange({ from: 0, to: 1 });

    const positions = recordInsertedHtmlPositions(editor);

    editor.commands.undo();

    expect(editor.state.doc.child(0).type.name).toBe('html');
    expect(positions).toEqual([null]);
    editor.destroy();
  });

  it('should ignore edits that do not add the node', () => {
    const editor = createEditor([{ type: 'html' }, HELLO_PARAGRAPH]);
    const positions = recordInsertedHtmlPositions(editor);

    editor.commands.insertContentAt(3, ' world');

    expect(positions).toEqual([null]);
    editor.destroy();
  });
});
