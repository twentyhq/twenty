import { richTextDocumentSchema } from 'twenty-shared/utils';

import { convertMarkdownToRichTextDocument } from 'src/engine/core-modules/record-transformer/utils/convert-markdown-to-rich-text-document.util';

const convert = (markdown: string) => {
  const document = convertMarkdownToRichTextDocument(markdown);

  expect(richTextDocumentSchema.safeParse(document).success).toBe(true);

  return document.content;
};

const text = (value: string, marks?: Record<string, unknown>[]) =>
  marks === undefined
    ? { type: 'text', text: value }
    : { type: 'text', text: value, marks };

const paragraph = (...content: Record<string, unknown>[]) => ({
  type: 'paragraph',
  content,
});

const listItem = (...content: Record<string, unknown>[]) => ({
  type: 'listItem',
  content,
});

describe('convertMarkdownToRichTextDocument', () => {
  it('should convert headings and inline styles', () => {
    expect(
      convert(
        '## Title\n\n**bold *both*** ~~gone~~ `code` [link **x**](https://example.com)',
      ),
    ).toEqual([
      { type: 'heading', attrs: { level: 2 }, content: [text('Title')] },
      paragraph(
        text('bold ', [{ type: 'bold' }]),
        text('both', [{ type: 'bold' }, { type: 'italic' }]),
        text(' '),
        text('gone', [{ type: 'strike' }]),
        text(' '),
        text('code', [{ type: 'code' }]),
        text(' '),
        text('link ', [
          { type: 'link', attrs: { href: 'https://example.com' } },
        ]),
        text('x', [
          { type: 'bold' },
          { type: 'link', attrs: { href: 'https://example.com' } },
        ]),
      ),
    ]);
  });

  it('should turn soft and hard line breaks into hard breaks', () => {
    expect(convert('first  \nsecond\nthird')).toEqual([
      paragraph(
        text('first'),
        { type: 'hardBreak' },
        text('second'),
        { type: 'hardBreak' },
        text('third'),
      ),
    ]);
  });

  it('should convert ordered, nested and task lists', () => {
    expect(convert('3. three\n4. four\n   - nested\n\n- [x] done')).toEqual([
      {
        type: 'orderedList',
        attrs: { start: 3 },
        content: [
          listItem(paragraph(text('three'))),
          listItem(paragraph(text('four')), {
            type: 'bulletList',
            content: [listItem(paragraph(text('nested')))],
          }),
        ],
      },
      {
        type: 'taskList',
        content: [
          {
            type: 'taskItem',
            attrs: { checked: true },
            content: [paragraph(text('done'))],
          },
        ],
      },
    ]);
  });

  it('should only nest under an ordered item when indented past its marker', () => {
    const listTypes = (markdown: string) =>
      convert(markdown)?.map((node) => ({
        type: node.type,
        nestedTypes: node.content?.[0]?.content
          ?.slice(1)
          .map((child) => child.type),
      }));

    expect(listTypes('1. first\n  - two spaces')).toEqual([
      { type: 'orderedList', nestedTypes: [] },
      { type: 'bulletList', nestedTypes: [] },
    ]);
    expect(listTypes('1. first\n   - three spaces')).toEqual([
      { type: 'orderedList', nestedTypes: ['bulletList'] },
    ]);
  });

  it('should turn bare urls into links', () => {
    expect(convert('see https://example.com')).toEqual([
      paragraph(
        text('see '),
        text('https://example.com', [
          { type: 'link', attrs: { href: 'https://example.com' } },
        ]),
      ),
    ]);
  });

  it('should keep only the code mark on inline code, even inside a link', () => {
    expect(
      convert('**bold `code`** [link `code`](https://example.com)'),
    ).toEqual([
      paragraph(
        text('bold ', [{ type: 'bold' }]),
        text('code', [{ type: 'code' }]),
        text(' '),
        text('link ', [
          { type: 'link', attrs: { href: 'https://example.com' } },
        ]),
        text('code', [{ type: 'code' }]),
      ),
    ]);
  });

  it('should keep images inside list items after the item text', () => {
    expect(convert('- item ![logo](https://example.com/logo.png)')).toEqual([
      {
        type: 'bulletList',
        content: [
          listItem(paragraph(text('item ')), {
            type: 'image',
            attrs: { src: 'https://example.com/logo.png', alt: 'logo' },
          }),
        ],
      },
    ]);
  });

  it('should drop urls the rich text validator would reject', () => {
    expect(
      convert(
        '[click](javascript:alert%281%29) ![pixel](javascript:alert%281%29) [ok](https://example.com)',
      ),
    ).toEqual([
      paragraph(
        text('click pixel '),
        text('ok', [{ type: 'link', attrs: { href: 'https://example.com' } }]),
      ),
    ]);
  });

  it('should drop urls longer than the rich text validator accepts', () => {
    const longUrl = `https://example.com/${'a'.repeat(4_000)}`;

    expect(convert(`[long](${longUrl}) ![big](${longUrl})`)).toEqual([
      paragraph(text('long big')),
    ]);
  });

  it('should keep the blocks of a quote in source order', () => {
    expect(convert('> before\n>\n> - middle\n>\n> after')).toEqual([
      {
        type: 'blockquote',
        content: [
          paragraph(text('before')),
          {
            type: 'bulletList',
            content: [listItem(paragraph(text('middle')))],
          },
          paragraph(text('after')),
        ],
      },
    ]);
  });

  it('should keep text and nested images in source order', () => {
    expect(
      convert('**before ![logo](https://example.com/logo.png) after**')?.map(
        (node) => node.type,
      ),
    ).toEqual(['paragraph', 'image', 'paragraph']);
  });

  it('should convert tables with their column alignment', () => {
    expect(convert('| Plan | Seats |\n|---|--:|\n| Pro | 10 |')).toEqual([
      {
        type: 'table',
        content: [
          {
            type: 'tableRow',
            content: [
              { type: 'tableHeader', content: [paragraph(text('Plan'))] },
              {
                type: 'tableHeader',
                content: [
                  {
                    ...paragraph(text('Seats')),
                    attrs: { textAlign: 'right' },
                  },
                ],
              },
            ],
          },
          {
            type: 'tableRow',
            content: [
              { type: 'tableCell', content: [paragraph(text('Pro'))] },
              {
                type: 'tableCell',
                content: [
                  { ...paragraph(text('10')), attrs: { textAlign: 'right' } },
                ],
              },
            ],
          },
        ],
      },
    ]);
  });

  it('should convert code blocks and dividers', () => {
    expect(convert('```ts\nconst a = 1;\n```\n\n---')).toEqual([
      {
        type: 'codeBlock',
        attrs: { language: 'ts' },
        content: [text('const a = 1;')],
      },
      { type: 'divider' },
    ]);
  });

  it('should keep raw html as literal text', () => {
    expect(convert('Hello <b>world</b>\n\n<div>\n<p>raw</p>\n</div>')).toEqual([
      paragraph(text('Hello <b>world</b>')),
      paragraph(
        text('<div>'),
        { type: 'hardBreak' },
        text('<p>raw</p>'),
        { type: 'hardBreak' },
        text('</div>'),
      ),
    ]);
  });

  it('should return a single empty paragraph for empty markdown', () => {
    expect(convert('')).toEqual([{ type: 'paragraph' }]);
  });
});
