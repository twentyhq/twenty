import { getRichTextFieldEditorDocument } from '@/object-record/record-field/ui/utils/getRichTextFieldEditorDocument';

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
    content: [{ type: 'text', text: 'from blocknote', styles: {} }],
    children: [],
  },
]);

describe('getRichTextFieldEditorDocument', () => {
  it('should return undefined when there is no value', () => {
    expect(getRichTextFieldEditorDocument(undefined)).toBeUndefined();
    expect(getRichTextFieldEditorDocument(null)).toBeUndefined();
    expect(
      getRichTextFieldEditorDocument({
        markdown: '',
        blocknote: null,
        tiptap: null,
      }),
    ).toBeUndefined();
  });

  it('should prefer the TipTap document over legacy values', () => {
    expect(
      getRichTextFieldEditorDocument({
        markdown: 'from markdown',
        blocknote,
        tiptap,
      }),
    ).toBe(tiptap);
  });

  it('should convert a legacy BlockNote document to TipTap', () => {
    const result = getRichTextFieldEditorDocument({
      markdown: 'from markdown',
      blocknote,
      tiptap: null,
    });

    expect(JSON.parse(result as string)).toMatchObject({
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [{ type: 'text', text: 'from blocknote' }],
        },
      ],
    });
  });

  it('should fall back to markdown when no document is stored', () => {
    expect(
      getRichTextFieldEditorDocument({
        markdown: 'from markdown',
        blocknote: null,
        tiptap: null,
      }),
    ).toBe('from markdown');
  });
});
