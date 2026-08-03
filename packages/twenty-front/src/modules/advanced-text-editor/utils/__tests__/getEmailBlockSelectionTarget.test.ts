import { ButtonNode } from '@/advanced-text-editor/extensions/blocks/ButtonNode';
import { ColumnNode } from '@/advanced-text-editor/extensions/blocks/ColumnNode';
import { ColumnsNode } from '@/advanced-text-editor/extensions/blocks/ColumnsNode';
import { DividerNode } from '@/advanced-text-editor/extensions/blocks/DividerNode';
import { SectionNode } from '@/advanced-text-editor/extensions/blocks/SectionNode';
import { getBlockSelectionTarget } from '@/advanced-text-editor/utils/getBlockSelectionTarget';
import { Editor } from '@tiptap/core';
import { Document } from '@tiptap/extension-document';
import { Paragraph } from '@tiptap/extension-paragraph';
import { Text } from '@tiptap/extension-text';
import { NodeSelection, TextSelection } from '@tiptap/pm/state';

const createEditor = (content: object) =>
  new Editor({
    extensions: [
      Document,
      Paragraph,
      Text,
      SectionNode,
      ColumnsNode,
      ColumnNode,
      ButtonNode,
      DividerNode,
    ],
    content,
  });

describe('getBlockSelectionTarget', () => {
  it('should return null when the cursor is in plain content', () => {
    const editor = createEditor({
      type: 'doc',
      content: [
        { type: 'paragraph', content: [{ type: 'text', text: 'plain' }] },
      ],
    });

    expect(getBlockSelectionTarget(editor)).toBeNull();
    editor.destroy();
  });

  it('should target the section containing the cursor', () => {
    const editor = createEditor({
      type: 'doc',
      content: [
        {
          type: 'section',
          attrs: { style: 'padding: 24px;' },
          content: [
            { type: 'paragraph', content: [{ type: 'text', text: 'inside' }] },
          ],
        },
      ],
    });

    editor.view.dispatch(
      editor.state.tr.setSelection(TextSelection.create(editor.state.doc, 3)),
    );

    const target = getBlockSelectionTarget(editor);

    expect(target?.nodeType).toBe('section');
    expect(target?.attrs.style).toBe('padding: 24px;');
    editor.destroy();
  });

  it('should prefer the deepest block: a button inside a section', () => {
    const editor = createEditor({
      type: 'doc',
      content: [
        {
          type: 'section',
          content: [
            {
              type: 'button',
              content: [{ type: 'text', text: 'Click' }],
            },
          ],
        },
      ],
    });

    editor.view.dispatch(
      editor.state.tr.setSelection(TextSelection.create(editor.state.doc, 3)),
    );

    expect(getBlockSelectionTarget(editor)?.nodeType).toBe('button');
    editor.destroy();
  });

  it('should target a node-selected divider', () => {
    const editor = createEditor({
      type: 'doc',
      content: [{ type: 'paragraph' }, { type: 'divider' }],
    });

    editor.view.dispatch(
      editor.state.tr.setSelection(NodeSelection.create(editor.state.doc, 2)),
    );

    expect(getBlockSelectionTarget(editor)?.nodeType).toBe('divider');
    editor.destroy();
  });
});
