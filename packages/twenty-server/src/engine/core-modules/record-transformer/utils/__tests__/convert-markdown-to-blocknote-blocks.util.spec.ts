import { convertMarkdownToBlocknoteBlocks } from 'src/engine/core-modules/record-transformer/utils/convert-markdown-to-blocknote-blocks.util';

const DEFAULT_PROPS = {
  backgroundColor: 'default',
  textColor: 'default',
  textAlignment: 'left',
};

const convertWithoutIds = (markdown: string) =>
  JSON.parse(
    JSON.stringify(convertMarkdownToBlocknoteBlocks(markdown), (key, value) =>
      key === 'id' ? undefined : value,
    ),
  );

const text = (value: string, styles: Record<string, true> = {}) => ({
  type: 'text',
  text: value,
  styles,
});

describe('convertMarkdownToBlocknoteBlocks', () => {
  it('should convert headings and inline styles', () => {
    expect(
      convertWithoutIds(
        '## Title\n\n**bold *both*** ~~gone~~ `code` [link **x**](https://example.com)',
      ),
    ).toEqual([
      {
        type: 'heading',
        props: { ...DEFAULT_PROPS, level: 2, isToggleable: false },
        content: [text('Title')],
        children: [],
      },
      {
        type: 'paragraph',
        props: DEFAULT_PROPS,
        content: [
          text('bold ', { bold: true }),
          text('both', { bold: true, italic: true }),
          text(' '),
          text('gone', { strike: true }),
          text(' '),
          text('code', { code: true }),
          text(' '),
          {
            type: 'link',
            href: 'https://example.com',
            content: [text('link '), text('x', { bold: true })],
          },
        ],
        children: [],
      },
    ]);
  });

  it('should turn soft and hard line breaks into newlines', () => {
    expect(convertWithoutIds('first  \nsecond\nthird')).toEqual([
      {
        type: 'paragraph',
        props: DEFAULT_PROPS,
        content: [text('first\nsecond\nthird')],
        children: [],
      },
    ]);
  });

  it('should convert ordered, nested and task lists', () => {
    expect(
      convertWithoutIds('3. three\n4. four\n   - nested\n\n- [x] done'),
    ).toEqual([
      {
        type: 'numberedListItem',
        props: { ...DEFAULT_PROPS, start: 3 },
        content: [text('three')],
        children: [],
      },
      {
        type: 'numberedListItem',
        props: DEFAULT_PROPS,
        content: [text('four')],
        children: [
          {
            type: 'bulletListItem',
            props: DEFAULT_PROPS,
            content: [text('nested')],
            children: [],
          },
        ],
      },
      {
        type: 'checkListItem',
        props: { ...DEFAULT_PROPS, checked: true },
        content: [text('done')],
        children: [],
      },
    ]);
  });

  it('should convert unchecked task items', () => {
    expect(convertWithoutIds('- [ ] todo')).toEqual([
      {
        type: 'checkListItem',
        props: { ...DEFAULT_PROPS, checked: false },
        content: [text('todo')],
        children: [],
      },
    ]);
  });

  it('should only nest under an ordered item when indented past its marker', () => {
    const blockTypes = (markdown: string) =>
      convertMarkdownToBlocknoteBlocks(markdown).map((block) => ({
        type: block.type,
        childTypes: block.children?.map((child) => child.type),
      }));

    expect(blockTypes('1. first\n  - two spaces')).toEqual([
      { type: 'numberedListItem', childTypes: [] },
      { type: 'bulletListItem', childTypes: [] },
    ]);
    expect(blockTypes('1. first\n   - three spaces')).toEqual([
      { type: 'numberedListItem', childTypes: ['bulletListItem'] },
    ]);
  });

  it('should turn bare urls into links', () => {
    expect(convertWithoutIds('see https://example.com')[0].content).toEqual([
      text('see '),
      {
        type: 'link',
        href: 'https://example.com',
        content: [text('https://example.com')],
      },
    ]);
  });

  it('should keep only the code style on inline code, even inside a link', () => {
    expect(
      convertWithoutIds('**bold `code`** [link `code`](https://example.com)')[0]
        .content,
    ).toEqual([
      text('bold ', { bold: true }),
      text('code', { code: true }),
      text(' '),
      {
        type: 'link',
        href: 'https://example.com',
        content: [text('link ')],
      },
      text('code', { code: true }),
    ]);
  });

  it('should turn images inside list items into image children', () => {
    const [listItem] = convertWithoutIds(
      '- item ![logo](https://example.com/logo.png)',
    );

    expect(listItem.content).toEqual([text('item ')]);
    expect(listItem.children).toEqual([
      expect.objectContaining({
        type: 'image',
        props: expect.objectContaining({
          name: 'logo',
          url: 'https://example.com/logo.png',
        }),
      }),
    ]);
  });

  it('should convert tables with their column alignment', () => {
    const cellProps = {
      colspan: 1,
      rowspan: 1,
      backgroundColor: 'default',
      textColor: 'default',
    };

    expect(
      convertWithoutIds('| Plan | Seats |\n|---|--:|\n| Pro | 10 |'),
    ).toEqual([
      {
        type: 'table',
        props: { textColor: 'default' },
        content: {
          type: 'tableContent',
          columnWidths: [null, null],
          headerRows: 1,
          rows: [
            {
              cells: [
                {
                  type: 'tableCell',
                  content: [text('Plan')],
                  props: { ...cellProps, textAlignment: 'left' },
                },
                {
                  type: 'tableCell',
                  content: [text('Seats')],
                  props: { ...cellProps, textAlignment: 'right' },
                },
              ],
            },
            {
              cells: [
                {
                  type: 'tableCell',
                  content: [text('Pro')],
                  props: { ...cellProps, textAlignment: 'left' },
                },
                {
                  type: 'tableCell',
                  content: [text('10')],
                  props: { ...cellProps, textAlignment: 'right' },
                },
              ],
            },
          ],
        },
        children: [],
      },
    ]);
  });

  it('should split a paragraph around images', () => {
    expect(
      convertWithoutIds('before ![logo](https://example.com/logo.png) after'),
    ).toEqual([
      {
        type: 'paragraph',
        props: DEFAULT_PROPS,
        content: [text('before ')],
        children: [],
      },
      {
        type: 'image',
        props: {
          textAlignment: 'left',
          backgroundColor: 'default',
          name: 'logo',
          url: 'https://example.com/logo.png',
          caption: '',
          showPreview: true,
        },
        children: [],
      },
      {
        type: 'paragraph',
        props: DEFAULT_PROPS,
        content: [text(' after')],
        children: [],
      },
    ]);
  });

  it('should convert quotes, code blocks and dividers', () => {
    expect(
      convertWithoutIds('> first\n>\n> second\n\n```\nplain\n```\n\n---'),
    ).toEqual([
      {
        type: 'quote',
        props: { backgroundColor: 'default', textColor: 'default' },
        content: [text('first\nsecond')],
        children: [],
      },
      {
        type: 'codeBlock',
        props: { language: 'text' },
        content: [text('plain')],
        children: [],
      },
      { type: 'divider', props: {}, children: [] },
    ]);
  });

  it('should keep raw html as literal text', () => {
    expect(
      convertWithoutIds('Hello <b>world</b>\n\n<div>\n<p>raw</p>\n</div>'),
    ).toEqual([
      {
        type: 'paragraph',
        props: DEFAULT_PROPS,
        content: [text('Hello <b>world</b>')],
        children: [],
      },
      {
        type: 'paragraph',
        props: DEFAULT_PROPS,
        content: [text('<div>\n<p>raw</p>\n</div>')],
        children: [],
      },
    ]);
  });

  it('should return a single empty paragraph for empty markdown', () => {
    expect(convertWithoutIds('')).toEqual([
      { type: 'paragraph', props: DEFAULT_PROPS, content: [], children: [] },
    ]);
  });

  it('should give every block a unique id', () => {
    const blocks = convertMarkdownToBlocknoteBlocks('- a\n  - b\n\nc');
    const ids = [blocks[0].id, blocks[0].children?.[0].id, blocks[1].id];

    expect(new Set(ids).size).toBe(3);
  });
});
