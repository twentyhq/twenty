import { getDropPosition } from '@/advanced-text-editor/utils/getDropPosition';
import { Editor, Node } from '@tiptap/core';
import { Document } from '@tiptap/extension-document';
import { ListKit } from '@tiptap/extension-list';
import { Paragraph } from '@tiptap/extension-paragraph';
import { Text } from '@tiptap/extension-text';
import { Fragment, Slice } from '@tiptap/pm/model';

const Divider = Node.create({
  name: 'divider',
  group: 'block',
  atom: true,
  parseHTML: () => [{ tag: 'hr' }],
  renderHTML: () => ['hr'],
});

const HOVERED_BLOCK_RECT = { top: 100, height: 40 } as DOMRect;
const UPPER_HALF_TOP = 110;
const LOWER_HALF_TOP = 130;

const paragraph = (text: string) => ({
  type: 'paragraph',
  content: [{ type: 'text', text }],
});

const listItem = (text: string) => ({
  type: 'listItem',
  content: [paragraph(text)],
});

const createEditor = (content: object[]) =>
  new Editor({
    extensions: [Document, Paragraph, Text, ListKit, Divider],
    content: { type: 'doc', content },
  });

const hover = (editor: Editor, position: { pos: number; inside: number }) => {
  jest.spyOn(editor.view, 'posAtCoords').mockReturnValue(position);
  jest.spyOn(editor.view, 'nodeDOM').mockImplementation(() => {
    const blockElement = document.createElement('div');

    blockElement.getBoundingClientRect = () => HOVERED_BLOCK_RECT;

    return blockElement;
  });
};

const createBlockSlice = (editor: Editor, json: object) =>
  new Slice(Fragment.from(editor.schema.nodeFromJSON(json)), 0, 0);

describe('getDropPosition', () => {
  it('should drop a block before a paragraph hovered in its upper half', () => {
    const editor = createEditor([paragraph('First'), paragraph('Second')]);

    hover(editor, { pos: 12, inside: 7 });

    expect(
      getDropPosition({
        view: editor.view,
        coordinates: { left: 0, top: UPPER_HALF_TOP },
        slice: createBlockSlice(editor, paragraph('Dragged')),
      }),
    ).toBe(7);
    editor.destroy();
  });

  it('should drop a block after a paragraph hovered in its lower half, even at the start of its text', () => {
    const editor = createEditor([paragraph('First'), paragraph('Second')]);

    hover(editor, { pos: 8, inside: 7 });

    expect(
      getDropPosition({
        view: editor.view,
        coordinates: { left: 0, top: LOWER_HALF_TOP },
        slice: createBlockSlice(editor, paragraph('Dragged')),
      }),
    ).toBe(15);
    editor.destroy();
  });

  it('should drop a block after a leaf block hovered in its lower half', () => {
    const editor = createEditor([
      paragraph('First'),
      { type: 'divider' },
      paragraph('Last'),
    ]);

    hover(editor, { pos: 8, inside: 7 });

    expect(
      getDropPosition({
        view: editor.view,
        coordinates: { left: 0, top: LOWER_HALF_TOP },
        slice: createBlockSlice(editor, paragraph('Dragged')),
      }),
    ).toBe(8);
    editor.destroy();
  });

  it('should drop a list item after the list item whose text is hovered in its lower half', () => {
    const editor = createEditor([
      { type: 'bulletList', content: [listItem('One'), listItem('Two')] },
    ]);

    hover(editor, { pos: 4, inside: 2 });

    expect(
      getDropPosition({
        view: editor.view,
        coordinates: { left: 0, top: LOWER_HALF_TOP },
        slice: createBlockSlice(editor, listItem('Dragged')),
      }),
    ).toBe(8);
    editor.destroy();
  });

  it('should keep the hovered text position for inline slices', () => {
    const editor = createEditor([paragraph('Hello world')]);

    hover(editor, { pos: 8, inside: 0 });

    expect(
      getDropPosition({
        view: editor.view,
        coordinates: { left: 0, top: LOWER_HALF_TOP },
        slice: editor.state.doc.slice(1, 6),
      }),
    ).toBe(8);
    editor.destroy();
  });

  it('should keep the hovered position between blocks', () => {
    const editor = createEditor([paragraph('First'), paragraph('Second')]);

    hover(editor, { pos: 15, inside: -1 });

    expect(
      getDropPosition({
        view: editor.view,
        coordinates: { left: 0, top: UPPER_HALF_TOP },
        slice: createBlockSlice(editor, paragraph('Dragged')),
      }),
    ).toBe(15);
    editor.destroy();
  });
});
