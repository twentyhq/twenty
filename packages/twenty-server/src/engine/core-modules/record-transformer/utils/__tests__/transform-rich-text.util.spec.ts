import { transformRichTextValue } from 'src/engine/core-modules/record-transformer/utils/transform-rich-text.util';

const BLOCKNOTE_VALUE = JSON.stringify([
  { id: '1', type: 'paragraph', content: [{ type: 'text', text: 'Hello' }] },
]);

const TIPTAP_VALUE = JSON.stringify({
  type: 'doc',
  content: [
    {
      type: 'paragraph',
      content: [{ type: 'text', text: 'Hello', marks: [{ type: 'bold' }] }],
    },
  ],
});

const blockTypesOf = (blocknote: string | null | undefined) =>
  JSON.parse(blocknote ?? '[]').map((block: { type: string }) => block.type);

describe('transformRichTextValue', () => {
  it('should build blocknote from markdown when only markdown is provided', async () => {
    const result = await transformRichTextValue({
      markdown: '# Title\n\n- item',
    });

    expect(result.markdown).toBe('# Title\n\n- item');
    expect(blockTypesOf(result.blocknote)).toEqual([
      'heading',
      'bulletListItem',
    ]);
  });

  it('should keep both values untouched when both are provided', async () => {
    const result = await transformRichTextValue({
      blocknote: BLOCKNOTE_VALUE,
      markdown: 'Hello',
    });

    expect(result).toEqual({ markdown: 'Hello', blocknote: BLOCKNOTE_VALUE });
  });

  it('should return nulls for an empty value', async () => {
    const result = await transformRichTextValue({
      blocknote: '',
      markdown: null,
    });

    expect(result).toEqual({ markdown: null, blocknote: null });
  });

  it('should rebuild blocknote from tiptap content', async () => {
    const result = await transformRichTextValue({ blocknote: TIPTAP_VALUE });

    expect(result.markdown).toBe('**Hello**');
    expect(JSON.parse(result.blocknote ?? '[]')[0]).toMatchObject({
      type: 'paragraph',
      content: [{ type: 'text', text: 'Hello', styles: { bold: true } }],
    });
  });
});
