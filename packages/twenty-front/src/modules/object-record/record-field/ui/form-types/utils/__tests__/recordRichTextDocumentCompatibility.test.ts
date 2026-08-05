import { convertTipTapDocumentToBlockNote } from '@/object-record/record-field/ui/form-types/utils/convertTipTapDocumentToBlockNote';
import { parseLegacyRecordRichTextDocument } from '@/object-record/record-field/ui/form-types/utils/parseLegacyRecordRichTextDocument';

describe('record rich-text document compatibility', () => {
  it('projects canonical documents to the legacy content-array shape', () => {
    const content = [
      {
        type: 'paragraph',
        content: [{ type: 'text', text: 'Hello' }],
      },
    ];

    expect(
      JSON.parse(
        convertTipTapDocumentToBlockNote(
          JSON.stringify({
            type: 'doc',
            attrs: { schemaVersion: 1 },
            content,
          }),
        ),
      ),
    ).toEqual(content);
  });

  it('preserves unknown legacy values at the write boundary', () => {
    expect(convertTipTapDocumentToBlockNote('legacy markdown')).toBe(
      'legacy markdown',
    );
  });

  it('reads the legacy content-array shape', () => {
    const content = [{ type: 'paragraph', content: [] }];

    expect(parseLegacyRecordRichTextDocument(JSON.stringify(content))).toEqual({
      type: 'doc',
      content,
    });
  });

  it('preserves permissive legacy BlockNote arrays', () => {
    const content = [
      { type: 'paragraph', content: 'Legacy BlockNote plain content' },
    ];

    expect(parseLegacyRecordRichTextDocument(JSON.stringify(content))).toEqual({
      type: 'doc',
      content,
    });
  });
});
