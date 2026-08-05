import { serializeAdvancedTextEditorContent } from '@/advanced-text-editor/utils/serializeAdvancedTextEditorContent';
import { Editor } from '@tiptap/core';
import { Document } from '@tiptap/extension-document';
import { Paragraph } from '@tiptap/extension-paragraph';
import { Text } from '@tiptap/extension-text';

describe('serializeAdvancedTextEditorContent', () => {
  const editor = new Editor({
    extensions: [Document, Paragraph, Text],
    content: '<p>Hello</p>',
  });

  afterAll(() => {
    editor.destroy();
  });

  it('should serialize to a JSON string for json content', () => {
    const serialized = serializeAdvancedTextEditorContent({
      editor,
      contentType: 'json',
    });

    expect(JSON.parse(serialized)).toMatchObject({
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [{ type: 'text', text: 'Hello' }],
        },
      ],
    });
  });

  it('should serialize to HTML for html content', () => {
    expect(
      serializeAdvancedTextEditorContent({ editor, contentType: 'html' }),
    ).toBe('<p>Hello</p>');
  });

  it('should serialize to HTML for markdown content', () => {
    expect(
      serializeAdvancedTextEditorContent({ editor, contentType: 'markdown' }),
    ).toBe('<p>Hello</p>');
  });
});
