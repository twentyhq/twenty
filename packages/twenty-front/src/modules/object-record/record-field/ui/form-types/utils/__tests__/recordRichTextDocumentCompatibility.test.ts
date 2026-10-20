import { parseLegacyRecordRichTextDocument } from '@/object-record/record-field/ui/form-types/utils/parseLegacyRecordRichTextDocument';

describe('record rich-text document compatibility', () => {
  it('reads the legacy content-array shape', () => {
    const content = [{ type: 'paragraph', content: [] }];

    expect(parseLegacyRecordRichTextDocument(JSON.stringify(content))).toEqual({
      type: 'doc',
      content,
    });
  });

  it('normalizes permissive legacy BlockNote string content', () => {
    const content = [
      { type: 'paragraph', content: 'Legacy BlockNote plain content' },
    ];

    expect(parseLegacyRecordRichTextDocument(JSON.stringify(content))).toEqual({
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [{ type: 'text', text: 'Legacy BlockNote plain content' }],
        },
      ],
    });
  });

  it('does not pass malformed legacy blocks to the editor', () => {
    const serializedDocument = JSON.stringify([
      { type: 'paragraph', marks: 'invalid' },
    ]);

    expect(parseLegacyRecordRichTextDocument(serializedDocument)).toEqual({
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [{ type: 'text', text: serializedDocument }],
        },
      ],
    });
  });
});
