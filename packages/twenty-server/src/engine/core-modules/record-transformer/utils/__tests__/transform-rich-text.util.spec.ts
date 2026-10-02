import { type RichTextConverters } from 'src/engine/core-modules/record-transformer/utils/blocknote-rich-text-converters.util';
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

const buildConverters = (): jest.Mocked<RichTextConverters> => ({
  convertMarkdownToBlocknote: jest.fn(
    async (
      markdown: string,
      _options: { shouldRejectSlowConversion: boolean },
    ) => `blocknote(${markdown})`,
  ),
  convertBlocknoteToMarkdown: jest.fn(
    async (_blocknote: string) => 'converted markdown',
  ),
});

describe('transformRichTextValue', () => {
  it('should convert markdown to blocknote when only markdown is provided', async () => {
    const converters = buildConverters();

    const result = await transformRichTextValue(
      { markdown: '# Title' },
      { converters },
    );

    expect(result).toEqual({
      markdown: '# Title',
      blocknote: 'blocknote(# Title)',
    });
    expect(converters.convertBlocknoteToMarkdown).not.toHaveBeenCalled();
  });

  it('should forward the slow conversion rejection to the markdown conversion', async () => {
    const converters = buildConverters();

    await transformRichTextValue(
      { markdown: '# Title' },
      { shouldRejectSlowConversion: true, converters },
    );

    expect(converters.convertMarkdownToBlocknote).toHaveBeenCalledWith(
      '# Title',
      { shouldRejectSlowConversion: true },
    );
  });

  it('should convert blocknote to markdown when only blocknote is provided', async () => {
    const converters = buildConverters();

    const result = await transformRichTextValue(
      { blocknote: BLOCKNOTE_VALUE, markdown: null },
      { converters },
    );

    expect(result).toEqual({
      markdown: 'converted markdown',
      blocknote: BLOCKNOTE_VALUE,
    });
    expect(converters.convertBlocknoteToMarkdown).toHaveBeenCalledWith(
      BLOCKNOTE_VALUE,
    );
    expect(converters.convertMarkdownToBlocknote).not.toHaveBeenCalled();
  });

  it('should not convert anything when both formats are provided', async () => {
    const converters = buildConverters();

    const result = await transformRichTextValue(
      { blocknote: BLOCKNOTE_VALUE, markdown: 'Hello' },
      { converters },
    );

    expect(result).toEqual({ markdown: 'Hello', blocknote: BLOCKNOTE_VALUE });
    expect(converters.convertBlocknoteToMarkdown).not.toHaveBeenCalled();
    expect(converters.convertMarkdownToBlocknote).not.toHaveBeenCalled();
  });

  it('should return nulls for an empty value without converting', async () => {
    const converters = buildConverters();

    const result = await transformRichTextValue(
      { blocknote: '', markdown: null },
      { converters },
    );

    expect(result).toEqual({ markdown: null, blocknote: null });
    expect(converters.convertBlocknoteToMarkdown).not.toHaveBeenCalled();
    expect(converters.convertMarkdownToBlocknote).not.toHaveBeenCalled();
  });

  it('should fall back to the raw blocknote when markdown conversion fails', async () => {
    const converters = buildConverters();

    converters.convertBlocknoteToMarkdown.mockRejectedValueOnce(
      new Error('Unsupported block'),
    );

    const result = await transformRichTextValue(
      { blocknote: BLOCKNOTE_VALUE },
      { converters },
    );

    expect(result).toEqual({
      markdown: BLOCKNOTE_VALUE,
      blocknote: BLOCKNOTE_VALUE,
    });
  });

  it('should rebuild blocknote from tiptap content', async () => {
    const converters = buildConverters();

    const result = await transformRichTextValue(
      { blocknote: TIPTAP_VALUE },
      { converters },
    );

    expect(result).toEqual({
      markdown: '**Hello**',
      blocknote: 'blocknote(**Hello**)',
    });
  });
});
