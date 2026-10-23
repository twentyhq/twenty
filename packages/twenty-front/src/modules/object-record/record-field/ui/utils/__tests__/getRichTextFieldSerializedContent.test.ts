import { getRichTextFieldSerializedContent } from '@/object-record/record-field/ui/utils/getRichTextFieldSerializedContent';

const tiptap = JSON.stringify({
  type: 'doc',
  attrs: { schemaVersion: 1 },
  content: [
    { type: 'paragraph', content: [{ type: 'text', text: 'from tiptap' }] },
  ],
});

const blocknote = JSON.stringify([
  {
    id: 'block-1',
    type: 'paragraph',
    props: {},
    content: [{ type: 'text', text: 'from blocknote', styles: { bold: true } }],
    children: [],
  },
]);

describe('getRichTextFieldSerializedContent', () => {
  it('should return undefined when there is no value', () => {
    expect(getRichTextFieldSerializedContent(undefined)).toBeUndefined();
    expect(getRichTextFieldSerializedContent(null)).toBeUndefined();
    expect(
      getRichTextFieldSerializedContent({
        markdown: '',
        blocknote: null,
        tiptap: null,
      }),
    ).toBeUndefined();
  });

  it('should prefer the TipTap document over legacy values', () => {
    expect(
      getRichTextFieldSerializedContent({
        markdown: 'from markdown',
        blocknote,
        tiptap,
      }),
    ).toBe(tiptap);
  });

  it('should convert a legacy BlockNote document to TipTap with its styles', () => {
    const result = getRichTextFieldSerializedContent({
      markdown: 'from markdown',
      blocknote,
      tiptap: null,
    });

    expect(JSON.parse(result ?? '')).toMatchObject({
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [
            {
              type: 'text',
              text: 'from blocknote',
              marks: [{ type: 'bold' }],
            },
          ],
        },
      ],
    });
  });

  it('should read TipTap blocks that older workflow forms stored in the BlockNote subfield', () => {
    const tipTapBlocks = [
      {
        type: 'heading',
        attrs: { level: 2 },
        content: [{ type: 'text', text: 'Title', marks: [{ type: 'italic' }] }],
      },
    ];

    const result = getRichTextFieldSerializedContent({
      markdown: null,
      blocknote: JSON.stringify(tipTapBlocks),
    });

    expect(JSON.parse(result ?? '')).toEqual({
      type: 'doc',
      content: tipTapBlocks,
    });
  });

  it('should fall back to markdown when no document is stored', () => {
    expect(
      getRichTextFieldSerializedContent({
        markdown: 'from markdown',
        blocknote: null,
        tiptap: null,
      }),
    ).toBe('from markdown');
  });
});
