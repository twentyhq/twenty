import { parseRecordRichTextInitialBlocks } from '@/object-record/record-field/ui/form-types/utils/parseRecordRichTextInitialBlocks';

const BLOCKNOTE_PARAGRAPH = JSON.stringify([
  {
    id: 'block-1',
    type: 'paragraph',
    props: {},
    content: [{ type: 'text', text: 'Hello', styles: {} }],
  },
]);

const TIPTAP_BULLET_LIST = JSON.stringify([
  {
    type: 'bulletList',
    content: [
      {
        type: 'listItem',
        content: [
          { type: 'paragraph', content: [{ type: 'text', text: 'Item' }] },
        ],
      },
    ],
  },
]);

describe('parseRecordRichTextInitialBlocks', () => {
  it('returns the blocks when the stored value is BlockNote', () => {
    expect(
      parseRecordRichTextInitialBlocks({
        blocknote: BLOCKNOTE_PARAGRAPH,
        markdown: null,
      }),
    ).toEqual(JSON.parse(BLOCKNOTE_PARAGRAPH));
  });

  it('does not return TipTap nodes the editor cannot mount', () => {
    expect(
      parseRecordRichTextInitialBlocks({
        blocknote: TIPTAP_BULLET_LIST,
        markdown: null,
      }),
    ).toBeUndefined();
  });

  it('does not return malformed json', () => {
    expect(
      parseRecordRichTextInitialBlocks({
        blocknote: 'not json',
        markdown: null,
      }),
    ).toBeUndefined();
  });

  it('does not return an empty block list', () => {
    expect(
      parseRecordRichTextInitialBlocks({ blocknote: '[]', markdown: null }),
    ).toBeUndefined();
  });

  it('falls back to a paragraph for a markdown only value', () => {
    expect(
      parseRecordRichTextInitialBlocks({
        blocknote: null,
        markdown: 'Legacy content',
      }),
    ).toEqual([{ type: 'paragraph', content: 'Legacy content' }]);
  });

  it('returns undefined when there is no value', () => {
    expect(parseRecordRichTextInitialBlocks(undefined)).toBeUndefined();
    expect(
      parseRecordRichTextInitialBlocks({ blocknote: null, markdown: null }),
    ).toBeUndefined();
  });
});
