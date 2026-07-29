import { EmailButton } from '@/advanced-text-editor/extensions/email-blocks/EmailButton';
import { EmailColumn } from '@/advanced-text-editor/extensions/email-blocks/EmailColumn';
import { EmailColumns } from '@/advanced-text-editor/extensions/email-blocks/EmailColumns';
import { EmailDivider } from '@/advanced-text-editor/extensions/email-blocks/EmailDivider';
import { EmailSection } from '@/advanced-text-editor/extensions/email-blocks/EmailSection';
import { getEmailBlockSelectionTarget } from '@/advanced-text-editor/utils/getEmailBlockSelectionTarget';
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
      EmailSection,
      EmailColumns,
      EmailColumn,
      EmailButton,
      EmailDivider,
    ],
    content,
  });

describe('getEmailBlockSelectionTarget', () => {
  it('should return null when the cursor is in plain content', () => {
    const editor = createEditor({
      type: 'doc',
      content: [
        { type: 'paragraph', content: [{ type: 'text', text: 'plain' }] },
      ],
    });

    expect(getEmailBlockSelectionTarget(editor)).toBeNull();
    editor.destroy();
  });

  it('should target the section containing the cursor', () => {
    const editor = createEditor({
      type: 'doc',
      content: [
        {
          type: 'emailSection',
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

    const target = getEmailBlockSelectionTarget(editor);

    expect(target?.nodeType).toBe('emailSection');
    expect(target?.attrs.style).toBe('padding: 24px;');
    editor.destroy();
  });

  it('should prefer the deepest block: a button inside a section', () => {
    const editor = createEditor({
      type: 'doc',
      content: [
        {
          type: 'emailSection',
          content: [
            {
              type: 'emailButton',
              content: [{ type: 'text', text: 'Click' }],
            },
          ],
        },
      ],
    });

    editor.view.dispatch(
      editor.state.tr.setSelection(TextSelection.create(editor.state.doc, 3)),
    );

    expect(getEmailBlockSelectionTarget(editor)?.nodeType).toBe('emailButton');
    editor.destroy();
  });

  it('should target a node-selected divider', () => {
    const editor = createEditor({
      type: 'doc',
      content: [{ type: 'paragraph' }, { type: 'emailDivider' }],
    });

    editor.view.dispatch(
      editor.state.tr.setSelection(NodeSelection.create(editor.state.doc, 2)),
    );

    expect(getEmailBlockSelectionTarget(editor)?.nodeType).toBe('emailDivider');
    editor.destroy();
  });
});
