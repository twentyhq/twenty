import { VariableTag } from '@/advanced-text-editor/extensions/variable-tag/VariableTag';
import { Editor } from '@tiptap/core';
import { Document } from '@tiptap/extension-document';
import { Paragraph } from '@tiptap/extension-paragraph';
import { Text } from '@tiptap/extension-text';

const renderVariableTagHtml = (variable: string) => {
  const editor = new Editor({
    extensions: [Document, Paragraph, Text, VariableTag],
    content: {
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [{ type: 'variableTag', attrs: { variable } }],
        },
      ],
    },
  });
  const html = editor.getHTML();

  editor.destroy();

  return html;
};

describe('VariableTag', () => {
  it('should export the field name of a variable with a fallback', () => {
    expect(
      renderVariableTagHtml('{{name.firstName | default: "Mr. X"}}'),
    ).toContain('>firstName</span>');
  });
});
