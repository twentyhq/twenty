import { transformRichTextValue } from 'src/engine/core-modules/record-transformer/utils/transform-rich-text.util';

const TIPTAP_VALUE = JSON.stringify({
  type: 'doc',
  attrs: { schemaVersion: 1 },
  content: [
    {
      type: 'paragraph',
      content: [{ type: 'text', text: 'Hello', marks: [{ type: 'bold' }] }],
    },
  ],
});

const BLOCKNOTE_VALUE = JSON.stringify([
  {
    id: '1',
    type: 'paragraph',
    props: {},
    content: [{ type: 'text', text: 'Hello', styles: { bold: true } }],
    children: [],
  },
]);

const nodeTypesOf = (tiptap: string | null | undefined) =>
  JSON.parse(tiptap ?? '{}').content.map((node: { type: string }) => node.type);

describe('transformRichTextValue', () => {
  it('should store TipTap as sent and derive the markdown from it', () => {
    const result = transformRichTextValue({ tiptap: TIPTAP_VALUE });

    expect(result).toEqual({
      tiptap: TIPTAP_VALUE,
      markdown: '**Hello**',
      blocknote: null,
    });
  });

  it('should ignore client markdown when TipTap is sent', () => {
    const result = transformRichTextValue({
      tiptap: TIPTAP_VALUE,
      markdown: 'stale markdown from the client',
    });

    expect(result).toEqual({
      tiptap: TIPTAP_VALUE,
      markdown: '**Hello**',
      blocknote: null,
    });
  });

  it('should stamp the schema version on TipTap sent without one', () => {
    const { attrs: _attrs, ...unversionedDocument } = JSON.parse(TIPTAP_VALUE);

    const result = transformRichTextValue({
      tiptap: JSON.stringify(unversionedDocument),
    });

    expect(JSON.parse(result.tiptap ?? '{}')).toEqual(JSON.parse(TIPTAP_VALUE));
    expect(result.markdown).toBe('**Hello**');
  });

  it('should build TipTap from markdown when only markdown is provided', () => {
    const result = transformRichTextValue({
      markdown: '# Title\n\n- item',
    });

    expect(result.markdown).toBe('# Title\n\n- item');
    expect(nodeTypesOf(result.tiptap)).toEqual(['heading', 'bulletList']);
  });

  it('should convert BlockNote sent by older clients to TipTap and keep it as sent', () => {
    const result = transformRichTextValue({
      blocknote: BLOCKNOTE_VALUE,
      markdown: null,
    });

    expect(result).toEqual({
      tiptap: TIPTAP_VALUE,
      markdown: '**Hello**',
      blocknote: BLOCKNOTE_VALUE,
    });
  });

  it('should derive the markdown from BlockNote rather than keep client markdown', () => {
    const result = transformRichTextValue({
      blocknote: BLOCKNOTE_VALUE,
      markdown: 'stale markdown from the client',
    });

    expect(result.markdown).toBe('**Hello**');
  });

  it('should clear the BlockNote value when TipTap is sent', () => {
    expect(
      transformRichTextValue({
        tiptap: TIPTAP_VALUE,
        blocknote: BLOCKNOTE_VALUE,
        markdown: null,
      }).blocknote,
    ).toBeNull();
  });

  it('should clear the BlockNote value when only markdown is sent', () => {
    expect(
      transformRichTextValue({ markdown: '**Hello**' }).blocknote,
    ).toBeNull();
  });

  it('should return nulls for an empty value', () => {
    const result = transformRichTextValue({
      blocknote: '',
      markdown: null,
    });

    expect(result).toEqual({ tiptap: null, markdown: null, blocknote: null });
  });
});
