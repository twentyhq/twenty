import { deserializeAdvancedTextEditorDocument } from '@/advanced-text-editor/utils/deserializeAdvancedTextEditorDocument';
import { getInitialEditorContent } from '@/advanced-text-editor/utils/getInitialEditorContent';
import { parseLegacyHtmlOrPlainTextDocument } from '@/advanced-text-editor/utils/parseLegacyHtmlOrPlainTextDocument';
import { parseLegacyPlainTextDocument } from '@/advanced-text-editor/utils/parseLegacyPlainTextDocument';
import { serializeAdvancedTextEditorDocument } from '@/advanced-text-editor/utils/serializeAdvancedTextEditorDocument';
import { serializePlainTextAsAdvancedTextEditorDocument } from '@/advanced-text-editor/utils/serializePlainTextAsAdvancedTextEditorDocument';
import { withLegacyVersionlessTipTapDocuments } from '@/advanced-text-editor/utils/withLegacyVersionlessTipTapDocuments';
import { type Editor } from '@tiptap/core';
import { TIPTAP_DOCUMENT_SCHEMA_VERSION } from 'twenty-shared/utils';

describe('advanced text editor document persistence', () => {
  const content = [
    {
      type: 'paragraph',
      content: [{ type: 'text', text: 'Hello' }],
    },
  ];

  it('serializes every editor profile as a versioned TipTap document', () => {
    const editor = {
      getJSON: () => ({ type: 'doc', content }),
    } as Editor;

    expect(JSON.parse(serializeAdvancedTextEditorDocument(editor))).toEqual({
      type: 'doc',
      attrs: { schemaVersion: TIPTAP_DOCUMENT_SCHEMA_VERSION },
      content,
    });
  });

  it('deserializes the canonical document without a profile codec', () => {
    const serializedDocument = JSON.stringify({
      type: 'doc',
      attrs: { schemaVersion: TIPTAP_DOCUMENT_SCHEMA_VERSION },
      content,
    });

    expect(
      deserializeAdvancedTextEditorDocument({ serializedDocument }),
    ).toEqual(JSON.parse(serializedDocument));
  });

  it('delegates non-canonical values to the profile legacy parser', () => {
    expect(
      deserializeAdvancedTextEditorDocument({
        serializedDocument: 'Line one\nLine two',
        parseLegacyDocument: parseLegacyPlainTextDocument,
      }),
    ).toEqual({
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [
            { type: 'text', text: 'Line one' },
            { type: 'hardBreak' },
            { type: 'text', text: 'Line two' },
          ],
        },
      ],
    });
  });

  it('uses the schema version to distinguish canonical documents from legacy text', () => {
    const versionlessDocument = JSON.stringify({ type: 'doc', content });

    expect(
      deserializeAdvancedTextEditorDocument({
        serializedDocument: versionlessDocument,
        parseLegacyDocument: parseLegacyPlainTextDocument,
      }),
    ).toEqual(parseLegacyPlainTextDocument(versionlessDocument));
  });

  it('supports versionless TipTap documents only through an explicit legacy adapter', () => {
    const versionlessDocument = JSON.stringify({ type: 'doc', content });

    expect(
      deserializeAdvancedTextEditorDocument({
        serializedDocument: versionlessDocument,
        parseLegacyDocument: withLegacyVersionlessTipTapDocuments(
          parseLegacyPlainTextDocument,
        ),
      }),
    ).toEqual(JSON.parse(versionlessDocument));
  });

  it('recognizes structured and self-closing legacy HTML fragments', () => {
    const documents = [
      '<p>Hello</p>',
      '<br/>Hello',
      '<img src="https://example.com/image.png"/>',
      '<!-- greeting --><div>Hello</div>',
    ];

    for (const document of documents) {
      expect(parseLegacyHtmlOrPlainTextDocument(document)).toBe(document);
    }
  });

  it('keeps a leading tag-like token as legacy plain text', () => {
    const document = '<support> {{contact.name}}';

    expect(parseLegacyHtmlOrPlainTextDocument(document)).toEqual(
      getInitialEditorContent(document),
    );
  });

  it('normalizes legacy plain-text line endings', () => {
    expect(
      parseLegacyPlainTextDocument('Line one\r\nLine two\rLine three'),
    ).toEqual({
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [
            { type: 'text', text: 'Line one' },
            { type: 'hardBreak' },
            { type: 'text', text: 'Line two' },
            { type: 'hardBreak' },
            { type: 'text', text: 'Line three' },
          ],
        },
      ],
    });
  });

  it('creates canonical documents for plain-text entry points', () => {
    expect(
      JSON.parse(serializePlainTextAsAdvancedTextEditorDocument('Ask Twenty')),
    ).toEqual({
      type: 'doc',
      attrs: { schemaVersion: TIPTAP_DOCUMENT_SCHEMA_VERSION },
      content: [
        {
          type: 'paragraph',
          content: [{ type: 'text', text: 'Ask Twenty' }],
        },
      ],
    });
  });
});
