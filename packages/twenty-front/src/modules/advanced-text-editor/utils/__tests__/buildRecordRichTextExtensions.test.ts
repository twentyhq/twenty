import { Editor, type JSONContent } from '@tiptap/core';
import { richTextDocumentSchema } from 'twenty-shared/utils';

import { type AdvancedTextEditorProfile } from '@/advanced-text-editor/types/AdvancedTextEditorProfile';
import { buildAdvancedTextEditorExtensions } from '@/advanced-text-editor/utils/buildAdvancedTextEditorExtensions';
import { buildRecordRichTextExtensions } from '@/advanced-text-editor/utils/buildRecordRichTextExtensions';
import { getStorableEditorDocument } from '@/advanced-text-editor/utils/getStorableEditorDocument';
import { serializeAdvancedTextEditorDocument } from '@/advanced-text-editor/utils/serializeAdvancedTextEditorDocument';
import { serializeJsonContentAsAdvancedTextEditorDocument } from '@/advanced-text-editor/utils/serializeJsonContentAsAdvancedTextEditorDocument';

jest.mock('@tiptap/react', () => ({
  ...jest.requireActual('@tiptap/react'),
  ReactNodeViewRenderer: () => () => ({}),
}));

const text = (value: string, marks?: JSONContent['marks']): JSONContent =>
  marks === undefined
    ? { type: 'text', text: value }
    : { type: 'text', text: value, marks };

const paragraph = (value: string): JSONContent => ({
  type: 'paragraph',
  content: [text(value)],
});

const DOCUMENT_WITH_EVERY_NODE_AND_MARK: JSONContent = {
  type: 'doc',
  attrs: { schemaVersion: 1 },
  content: [
    {
      type: 'heading',
      attrs: { level: 2, textAlign: 'justify' },
      content: [text('Heading')],
    },
    {
      type: 'paragraph',
      attrs: { textAlign: 'center' },
      content: [
        text('bold', [{ type: 'bold' }]),
        text('italic', [{ type: 'italic' }]),
        text('underline', [{ type: 'underline' }]),
        text('strike', [{ type: 'strike' }]),
        text('code', [{ type: 'code' }]),
        text('link', [{ type: 'link', attrs: { href: 'https://twenty.com' } }]),
        text('colored', [
          {
            type: 'textStyle',
            attrs: { textColor: 'red', backgroundColor: 'yellow' },
          },
        ]),
        { type: 'hardBreak' },
        {
          type: 'mentionTag',
          attrs: {
            recordId: '20202020-0000-4000-8000-000000000001',
            objectNameSingular: 'person',
            label: 'Tim Apple',
          },
        },
      ],
    },
    {
      type: 'bulletList',
      content: [{ type: 'listItem', content: [paragraph('bullet')] }],
    },
    {
      type: 'orderedList',
      attrs: { start: 3 },
      content: [{ type: 'listItem', content: [paragraph('ordered')] }],
    },
    {
      type: 'taskList',
      content: [
        {
          type: 'taskItem',
          attrs: { checked: true },
          content: [paragraph('task')],
        },
      ],
    },
    { type: 'blockquote', content: [paragraph('quote')] },
    {
      type: 'codeBlock',
      attrs: { language: null },
      content: [text('const value = 1;')],
    },
    { type: 'divider' },
    {
      type: 'image',
      attrs: {
        src: 'https://twenty.com/image.png',
        alt: 'image.png',
        title: 'Caption',
        width: 320,
      },
    },
    {
      type: 'file',
      attrs: { url: 'https://twenty.com/file.pdf', name: 'file.pdf' },
    },
    {
      type: 'table',
      content: [
        {
          type: 'tableRow',
          content: [
            { type: 'tableHeader', content: [paragraph('header')] },
            { type: 'tableHeader', content: [paragraph('header')] },
          ],
        },
        {
          type: 'tableRow',
          content: [
            {
              type: 'tableCell',
              attrs: { colspan: 2, rowspan: 1, colwidth: [120, 80] },
              content: [paragraph('cell')],
            },
          ],
        },
      ],
    },
  ],
};

const createEditor = (
  content: JSONContent = DOCUMENT_WITH_EVERY_NODE_AND_MARK,
) =>
  new Editor({
    extensions: buildAdvancedTextEditorExtensions({
      profile: {
        chrome: 'document',
        variant: 'app',
        minHeight: 0,
        enableFullScreen: false,
        buildExtensions: buildRecordRichTextExtensions,
      } satisfies AdvancedTextEditorProfile,
      context: {},
      placeholder: undefined,
      readonly: false,
    }),
    content,
  });

describe('buildRecordRichTextExtensions', () => {
  it('uses a fixture the rich text document schema accepts', () => {
    expect(
      richTextDocumentSchema.safeParse(DOCUMENT_WITH_EVERY_NODE_AND_MARK)
        .success,
    ).toBe(true);
  });

  it('keeps every node, mark and attribute the rich text document schema allows', () => {
    const editor = createEditor();

    expect(
      JSON.parse(serializeAdvancedTextEditorDocument(editor)),
    ).toMatchObject(DOCUMENT_WITH_EVERY_NODE_AND_MARK);

    editor.destroy();
  });

  it('produces documents the rich text document schema accepts', () => {
    const editor = createEditor();

    const result = richTextDocumentSchema.safeParse(
      JSON.parse(serializeAdvancedTextEditorDocument(editor)),
    );

    expect(result).toEqual(expect.objectContaining({ success: true }));

    editor.destroy();
  });

  it('stores documents without images the rich text document validator would reject', () => {
    const editor = createEditor();

    editor.commands.setContent(
      '<table><tr><td><img src="file:///C:/pasted.png"></td></tr></table>',
    );

    expect(JSON.stringify(editor.getJSON())).toContain('pasted.png');

    const storableDocument = serializeJsonContentAsAdvancedTextEditorDocument(
      getStorableEditorDocument(editor),
    );

    expect(storableDocument).not.toContain('pasted.png');
    expect(
      richTextDocumentSchema.safeParse(JSON.parse(storableDocument)).success,
    ).toBe(true);

    editor.destroy();
  });

  it('drops links the rich text document validator would reject', () => {
    const editor = createEditor();

    editor.commands.setContent(
      '<p><a href="#cite-1">anchor</a> <a href="ftp://twenty.com">ftp</a> <a href="https://twenty.com">safe</a></p>',
    );

    const linkHrefs = editor
      .getJSON()
      .content?.[0]?.content?.flatMap((node) => node.marks ?? [])
      .map((mark) => mark.attrs?.href);

    expect(linkHrefs).toEqual(['https://twenty.com']);

    editor.destroy();
  });
});
