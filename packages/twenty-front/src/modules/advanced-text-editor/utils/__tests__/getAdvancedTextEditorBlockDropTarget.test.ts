import { ColumnNode } from '@/advanced-text-editor/extensions/blocks/ColumnNode';
import { ColumnsNode } from '@/advanced-text-editor/extensions/blocks/ColumnsNode';
import { SectionNode } from '@/advanced-text-editor/extensions/blocks/SectionNode';
import { getAdvancedTextEditorBlockDropTarget } from '@/advanced-text-editor/utils/getAdvancedTextEditorBlockDropTarget';
import { Editor } from '@tiptap/core';
import { Document } from '@tiptap/extension-document';
import { Paragraph } from '@tiptap/extension-paragraph';
import { Text } from '@tiptap/extension-text';

type Box = { top: number; bottom: number; left: number; right: number };

const stubBox = (element: Element, { top, bottom, left, right }: Box) => {
  const rect = new DOMRect(left, top, right - left, bottom - top);

  element.getBoundingClientRect = () => rect;
};

const createEditor = (content: object) =>
  new Editor({
    extensions: [
      Document,
      Paragraph,
      Text,
      SectionNode,
      ColumnsNode,
      ColumnNode,
    ],
    content,
  });

const paragraph = (text: string) => ({
  type: 'paragraph',
  content: [{ type: 'text', text }],
});

const stubBlockAt = (editor: Editor, pos: number, box: Box) => {
  const element = editor.view.nodeDOM(pos);

  if (!(element instanceof HTMLElement)) {
    throw new Error(`No block element at ${pos}`);
  }

  stubBox(element, box);
};

const getDropTarget = (
  editor: Editor,
  clientX: number,
  clientY: number,
  sourceRange: { from: number; to: number } | null = null,
) =>
  getAdvancedTextEditorBlockDropTarget({
    editor,
    draggedNodeType: editor.schema.nodes.paragraph,
    sourceRange,
    clientX,
    clientY,
  });

describe('getAdvancedTextEditorBlockDropTarget', () => {
  const setUpTwoParagraphs = () => {
    const editor = createEditor({
      type: 'doc',
      content: [paragraph('first'), paragraph('second')],
    });

    stubBox(editor.view.dom, { top: 0, bottom: 200, left: 0, right: 400 });
    stubBlockAt(editor, 0, { top: 0, bottom: 20, left: 0, right: 400 });
    stubBlockAt(editor, 7, { top: 30, bottom: 50, left: 0, right: 400 });

    return editor;
  };

  it('drops between two blocks when the pointer is on the lower half of the first', () => {
    const editor = setUpTwoParagraphs();

    expect(getDropTarget(editor, 100, 15)).toEqual({
      from: 7,
      to: 7,
      indicatorTop: 24,
      indicatorLeft: 0,
      indicatorWidth: 400,
      indicatorHeight: 2,
    });
    editor.destroy();
  });

  it('drops before the first block when the pointer is above it', () => {
    const editor = setUpTwoParagraphs();

    expect(getDropTarget(editor, 100, 2)?.from).toBe(0);
    editor.destroy();
  });

  it('drops at the end of the document when the pointer is below every block', () => {
    const editor = setUpTwoParagraphs();

    expect(getDropTarget(editor, 100, 150)?.from).toBe(
      editor.state.doc.content.size,
    );
    editor.destroy();
  });

  it('returns null when the pointer is far outside the editor', () => {
    const editor = setUpTwoParagraphs();

    expect(getDropTarget(editor, 900, 15)).toBeNull();
    editor.destroy();
  });

  it('shows no drop target when moving a block onto its own position', () => {
    const editor = setUpTwoParagraphs();
    const firstParagraph = { from: 0, to: 7 };

    expect(getDropTarget(editor, 100, 2, firstParagraph)).toBeNull();
    expect(getDropTarget(editor, 100, 15, firstParagraph)).toBeNull();
    editor.destroy();
  });

  it('offers the gap below the next block when moving a block down', () => {
    const editor = setUpTwoParagraphs();

    expect(getDropTarget(editor, 100, 150, { from: 0, to: 7 })?.from).toBe(
      editor.state.doc.content.size,
    );
    editor.destroy();
  });

  it('replaces the placeholder paragraph of an empty document', () => {
    const editor = createEditor({
      type: 'doc',
      content: [{ type: 'paragraph' }],
    });

    stubBox(editor.view.dom, { top: 0, bottom: 200, left: 0, right: 400 });
    stubBlockAt(editor, 0, { top: 0, bottom: 20, left: 0, right: 400 });

    expect(getDropTarget(editor, 100, 50)).toMatchObject({ from: 0, to: 2 });
    editor.destroy();
  });

  it('drops inside a section when the pointer is within it', () => {
    const editor = createEditor({
      type: 'doc',
      content: [{ type: 'section', content: [paragraph('a'), paragraph('b')] }],
    });

    stubBox(editor.view.dom, { top: 0, bottom: 200, left: 0, right: 400 });
    stubBlockAt(editor, 0, { top: 0, bottom: 100, left: 0, right: 400 });
    stubBlockAt(editor, 1, { top: 10, bottom: 30, left: 10, right: 390 });
    stubBlockAt(editor, 4, { top: 40, bottom: 60, left: 10, right: 390 });

    expect(getDropTarget(editor, 100, 25)?.from).toBe(4);
    editor.destroy();
  });

  it('drops before a section when the pointer is on its top edge', () => {
    const editor = createEditor({
      type: 'doc',
      content: [{ type: 'section', content: [paragraph('a')] }],
    });

    stubBox(editor.view.dom, { top: 0, bottom: 200, left: 0, right: 400 });
    stubBlockAt(editor, 0, { top: 0, bottom: 100, left: 0, right: 400 });
    stubBlockAt(editor, 1, { top: 10, bottom: 30, left: 10, right: 390 });

    expect(getDropTarget(editor, 100, 3)?.from).toBe(0);
    editor.destroy();
  });

  it('drops into the column under the pointer', () => {
    const editor = createEditor({
      type: 'doc',
      content: [
        {
          type: 'columns',
          content: [
            { type: 'column', content: [paragraph('left')] },
            { type: 'column', content: [paragraph('right')] },
          ],
        },
      ],
    });
    const rightColumnPos = 9;
    const rightColumnContentEnd = 17;

    stubBox(editor.view.dom, { top: 0, bottom: 200, left: 0, right: 400 });
    stubBlockAt(editor, 0, { top: 0, bottom: 100, left: 0, right: 400 });
    stubBlockAt(editor, 1, { top: 0, bottom: 100, left: 0, right: 195 });
    stubBlockAt(editor, 2, { top: 10, bottom: 30, left: 0, right: 195 });
    stubBlockAt(editor, rightColumnPos, {
      top: 0,
      bottom: 100,
      left: 205,
      right: 400,
    });
    stubBlockAt(editor, rightColumnPos + 1, {
      top: 10,
      bottom: 30,
      left: 205,
      right: 400,
    });

    expect(getDropTarget(editor, 300, 50)?.from).toBe(rightColumnContentEnd);
    editor.destroy();
  });
});
