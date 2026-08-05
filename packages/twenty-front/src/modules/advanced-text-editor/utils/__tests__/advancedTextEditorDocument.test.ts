import { deserializeAdvancedTextEditorDocument } from '@/advanced-text-editor/utils/deserializeAdvancedTextEditorDocument';
import { parseLegacyPlainTextDocument } from '@/advanced-text-editor/utils/parseLegacyPlainTextDocument';
import { serializeAdvancedTextEditorDocument } from '@/advanced-text-editor/utils/serializeAdvancedTextEditorDocument';
import { serializePlainTextAsAdvancedTextEditorDocument } from '@/advanced-text-editor/utils/serializePlainTextAsAdvancedTextEditorDocument';
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
