import { getRichTextFieldTextLines } from '@/object-record/record-field/ui/utils/getRichTextFieldTextLines';

const buildTipTap = (content: unknown[]) =>
  JSON.stringify({ type: 'doc', attrs: { schemaVersion: 1 }, content });

const buildParagraph = (text?: string) => ({
  type: 'paragraph',
  content: text === undefined ? undefined : [{ type: 'text', text }],
});

describe('getRichTextFieldTextLines', () => {
  it('should return no lines for a missing body', () => {
    expect(getRichTextFieldTextLines(undefined)).toEqual([]);
    expect(getRichTextFieldTextLines(null)).toEqual([]);
    expect(getRichTextFieldTextLines({ markdown: null, tiptap: null })).toEqual(
      [],
    );
  });

  it('should return the non-empty paragraphs of a TipTap body', () => {
    const tiptap = buildTipTap([
      buildParagraph(),
      buildParagraph('   '),
      buildParagraph('test 1'),
      buildParagraph('test 2'),
      buildParagraph(),
    ]);

    expect(getRichTextFieldTextLines({ markdown: null, tiptap })).toEqual([
      'test 1',
      'test 2',
    ]);
  });

  it('should skip an image placed before the text', () => {
    const tiptap = buildTipTap([
      { type: 'image', attrs: { src: 'https://twenty-icons.com/a.png' } },
      buildParagraph('TEST'),
    ]);

    expect(getRichTextFieldTextLines({ markdown: null, tiptap })).toEqual([
      'TEST',
    ]);
  });

  it('should return no lines when a table has no text', () => {
    const tiptap = buildTipTap([
      {
        type: 'table',
        content: [
          {
            type: 'tableRow',
            content: [{ type: 'tableCell', content: [buildParagraph()] }],
          },
        ],
      },
      buildParagraph(),
    ]);

    expect(getRichTextFieldTextLines({ markdown: null, tiptap })).toEqual([]);
  });

  it('should read headings, lists, links and mentions', () => {
    const tiptap = buildTipTap([
      {
        type: 'heading',
        attrs: { level: 1 },
        content: [{ type: 'text', text: 'Title' }],
      },
      {
        type: 'bulletList',
        content: [
          {
            type: 'listItem',
            content: [buildParagraph('first item')],
          },
          {
            type: 'listItem',
            content: [
              {
                type: 'paragraph',
                content: [
                  { type: 'text', text: 'see ' },
                  {
                    type: 'text',
                    text: 'twenty.com',
                    marks: [
                      { type: 'link', attrs: { href: 'https://twenty.com' } },
                    ],
                  },
                  { type: 'mentionTag', attrs: { label: 'Ada' } },
                ],
              },
            ],
          },
        ],
      },
    ]);

    expect(getRichTextFieldTextLines({ markdown: null, tiptap })).toEqual([
      'Title',
      'first item',
      'see twenty.comAda',
    ]);
  });

  it('should fall back to a legacy BlockNote body', () => {
    const blocknote = JSON.stringify([
      {
        id: 'block-1',
        type: 'paragraph',
        props: {},
        content: [{ type: 'text', text: 'legacy text', styles: {} }],
        children: [],
      },
    ]);

    expect(getRichTextFieldTextLines({ markdown: null, blocknote })).toEqual([
      'legacy text',
    ]);
  });

  it('should fall back to markdown when there is no document', () => {
    expect(
      getRichTextFieldTextLines({
        markdown: '\nline one\n\nline two',
        tiptap: null,
      }),
    ).toEqual(['line one', 'line two']);
  });
});
