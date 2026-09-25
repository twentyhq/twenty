import { ColumnNode } from '@/advanced-text-editor/extensions/blocks/ColumnNode';
import { ColumnsNode } from '@/advanced-text-editor/extensions/blocks/ColumnsNode';
import { SectionNode } from '@/advanced-text-editor/extensions/blocks/SectionNode';
import { getAdvancedTextEditorHoveredBlock } from '@/advanced-text-editor/utils/getAdvancedTextEditorHoveredBlock';
import { Editor } from '@tiptap/core';
import { Document } from '@tiptap/extension-document';
import { Paragraph } from '@tiptap/extension-paragraph';
import { Text } from '@tiptap/extension-text';

type Box = { top: number; bottom: number; left: number; right: number };

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

const stubBlockAt = (editor: Editor, pos: number, box: Box) => {
  const element = editor.view.nodeDOM(pos);

  if (!(element instanceof HTMLElement)) {
    throw new Error(`No block element at ${pos}`);
  }

  const rect = new DOMRect(
    box.left,
    box.top,
    box.right - box.left,
    box.bottom - box.top,
  );

  element.getBoundingClientRect = () => rect;
};

const getHoveredTypeAndPos = (
  editor: Editor,
  clientX: number,
  clientY: number,
) => {
  const hoveredBlock = getAdvancedTextEditorHoveredBlock({
    editor,
    clientX,
    clientY,
  });

  return hoveredBlock === null
    ? null
    : { type: hoveredBlock.node.type.name, pos: hoveredBlock.pos };
};

describe('getAdvancedTextEditorHoveredBlock', () => {
  it('keeps the closest top-level block when the pointer is in a gap or the gutter', () => {
    const editor = createEditor([paragraph('a'), paragraph('b')]);

    stubBlockAt(editor, 0, { top: 0, bottom: 20, left: 100, right: 500 });
    stubBlockAt(editor, 3, { top: 40, bottom: 60, left: 100, right: 500 });

    expect(getHoveredTypeAndPos(editor, 20, 10)).toEqual({
      type: 'paragraph',
      pos: 0,
    });
    expect(getHoveredTypeAndPos(editor, 300, 35)).toEqual({
      type: 'paragraph',
      pos: 3,
    });
    editor.destroy();
  });

  it('targets a block inside a section, and the section from its padding', () => {
    const editor = createEditor([
      { type: 'section', content: [paragraph('a'), paragraph('b')] },
    ]);

    stubBlockAt(editor, 0, { top: 0, bottom: 100, left: 0, right: 400 });
    stubBlockAt(editor, 1, { top: 20, bottom: 40, left: 20, right: 380 });
    stubBlockAt(editor, 4, { top: 50, bottom: 70, left: 20, right: 380 });

    expect(getHoveredTypeAndPos(editor, 200, 47)).toEqual({
      type: 'paragraph',
      pos: 4,
    });
    expect(getHoveredTypeAndPos(editor, 200, 12)).toEqual({
      type: 'section',
      pos: 0,
    });
    editor.destroy();
  });

  it('targets the block in the hovered column, and the columns block between them', () => {
    const editor = createEditor([
      {
        type: 'columns',
        content: [
          { type: 'column', content: [paragraph('left')] },
          { type: 'column', content: [paragraph('right')] },
        ],
      },
    ]);

    stubBlockAt(editor, 0, { top: 0, bottom: 100, left: 0, right: 400 });
    stubBlockAt(editor, 1, { top: 0, bottom: 100, left: 0, right: 190 });
    stubBlockAt(editor, 2, { top: 10, bottom: 30, left: 0, right: 190 });
    stubBlockAt(editor, 9, { top: 0, bottom: 100, left: 210, right: 400 });
    stubBlockAt(editor, 10, { top: 10, bottom: 30, left: 210, right: 400 });

    expect(getHoveredTypeAndPos(editor, 300, 20)).toEqual({
      type: 'paragraph',
      pos: 10,
    });
    expect(getHoveredTypeAndPos(editor, 300, 80)).toEqual({
      type: 'columns',
      pos: 0,
    });
    editor.destroy();
  });
});
