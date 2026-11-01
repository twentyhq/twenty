import { HtmlDocumentNode } from '@/advanced-text-editor/extensions/blocks/HtmlDocumentNode';
import { getSchema } from '@tiptap/core';
import { Document } from '@tiptap/extension-document';
import { Paragraph } from '@tiptap/extension-paragraph';
import { Text } from '@tiptap/extension-text';
import { DOMParser, DOMSerializer } from '@tiptap/pm/model';

describe('HtmlDocumentNode', () => {
  it('keeps the block and its HTML through the HTML the clipboard carries', () => {
    const schema = getSchema([Document, Paragraph, Text, HtmlDocumentNode]);
    const document = {
      type: 'doc',
      content: [
        {
          type: 'htmlDocument',
          attrs: {
            html: '<table><tr><td>Hi {{trigger.name}}</td></tr></table>',
          },
        },
      ],
    };

    const clipboardContainer = window.document.createElement('div');

    clipboardContainer.appendChild(
      DOMSerializer.fromSchema(schema).serializeFragment(
        schema.nodeFromJSON(document).content,
      ),
    );

    expect(
      DOMParser.fromSchema(schema).parse(clipboardContainer).toJSON(),
    ).toEqual(document);
  });
});
