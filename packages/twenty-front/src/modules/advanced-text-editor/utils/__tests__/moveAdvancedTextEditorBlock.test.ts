import { ColumnNode } from '@/advanced-text-editor/extensions/blocks/ColumnNode';
import { ColumnsNode } from '@/advanced-text-editor/extensions/blocks/ColumnsNode';
import { SectionNode } from '@/advanced-text-editor/extensions/blocks/SectionNode';
import { moveAdvancedTextEditorBlock } from '@/advanced-text-editor/utils/moveAdvancedTextEditorBlock';
import { Editor } from '@tiptap/core';
import { Document } from '@tiptap/extension-document';
import { Paragraph } from '@tiptap/extension-paragraph';
import { Text } from '@tiptap/extension-text';

const paragraph = (text: string) => ({
  type: 'paragraph',
  content: [{ type: 'text', text }],
});

const createEditor = (content: object[]) =>
  new Editor({
    extensions: [
      Document,
      Paragraph,
      Text,
      SectionNode,
      ColumnsNode,
      ColumnNode,
    ],
    content: { type: 'doc', content },
  });

const describeDocument = (editor: Editor) => {
  const blocks: string[] = [];

  editor.state.doc.descendants((node) => {
    if (node.isTextblock) {
      blocks.push(node.textContent);
      return false;
    }

    blocks.push(node.type.name);
    return true;
  });

  return blocks;
};

describe('moveAdvancedTextEditorBlock', () => {
  it('moves a block below its next sibling', () => {
    const editor = createEditor([paragraph('a'), paragraph('b')]);

    moveAdvancedTextEditorBlock(editor, { from: 0, to: 3 }, 6);

    expect(describeDocument(editor)).toEqual(['b', 'a']);
    editor.destroy();
  });

  it('moves a block above its previous sibling', () => {
    const editor = createEditor([paragraph('a'), paragraph('b')]);

    moveAdvancedTextEditorBlock(editor, { from: 3, to: 6 }, 0);

    expect(describeDocument(editor)).toEqual(['b', 'a']);
    editor.destroy();
  });

  it('moves a top-level block into a section', () => {
    const editor = createEditor([
      paragraph('a'),
      { type: 'section', content: [paragraph('b')] },
    ]);

    moveAdvancedTextEditorBlock(editor, { from: 0, to: 3 }, 7);

    expect(describeDocument(editor)).toEqual(['section', 'b', 'a']);
    editor.destroy();
  });

  it('keeps the document valid when moving the only block out of a section', () => {
    const editor = createEditor([
      { type: 'section', content: [paragraph('a')] },
      paragraph('b'),
    ]);

    moveAdvancedTextEditorBlock(editor, { from: 1, to: 4 }, 8);

    expect(() => editor.state.doc.check()).not.toThrow();
    expect(describeDocument(editor)).toContain('a');
    expect(describeDocument(editor).at(-1)).toBe('a');
    editor.destroy();
  });

  it('keeps a column valid when moving its only block out', () => {
    const editor = createEditor([
      {
        type: 'columns',
        content: [
          { type: 'column', content: [paragraph('left')] },
          { type: 'column', content: [paragraph('right')] },
        ],
      },
      paragraph('after'),
    ]);
    const documentEnd = editor.state.doc.content.size;

    moveAdvancedTextEditorBlock(editor, { from: 2, to: 8 }, documentEnd);

    expect(() => editor.state.doc.check()).not.toThrow();
    expect(describeDocument(editor).at(-1)).toBe('left');
    editor.destroy();
  });
});
