import { convertBlockNoteHtmlToBlocks } from 'src/engine/core-modules/record-transformer/utils/convert-blocknote-html-to-blocks.util';

const DEFAULT_PROPS = {
  backgroundColor: 'default',
  textColor: 'default',
  textAlignment: 'left',
};

const convertWithoutIds = (html: string) => {
  const conversion = convertBlockNoteHtmlToBlocks(html);

  if (conversion.status !== 'converted') {
    return conversion;
  }

  return JSON.parse(
    JSON.stringify(conversion.blocks, (key, value) =>
      key === 'id' ? undefined : value,
    ),
  );
};

describe('convertBlockNoteHtmlToBlocks', () => {
  it('should convert headings and paragraphs with styles and links', () => {
    expect(
      convertWithoutIds(
        '<h2>Title</h2><p><strong>bold</strong> <em>italic</em> <del>gone</del> <a href="https://example.com">link <strong>text</strong></a></p>',
      ),
    ).toEqual([
      {
        type: 'heading',
        props: { ...DEFAULT_PROPS, level: 2, isToggleable: false },
        content: [{ type: 'text', text: 'Title', styles: {} }],
        children: [],
      },
      {
        type: 'paragraph',
        props: DEFAULT_PROPS,
        content: [
          { type: 'text', text: 'bold', styles: { bold: true } },
          { type: 'text', text: ' ', styles: {} },
          { type: 'text', text: 'italic', styles: { italic: true } },
          { type: 'text', text: ' ', styles: {} },
          { type: 'text', text: 'gone', styles: { strike: true } },
          { type: 'text', text: ' ', styles: {} },
          {
            type: 'link',
            href: 'https://example.com',
            content: [
              { type: 'text', text: 'link ', styles: {} },
              { type: 'text', text: 'text', styles: { bold: true } },
            ],
          },
        ],
        children: [],
      },
    ]);
  });

  it('should keep only the code style on inline code, even inside a link', () => {
    expect(
      convertWithoutIds(
        '<p><strong>a <code>x</code></strong> <a href="u">see <code>y</code></a></p>',
      ),
    ).toEqual([
      {
        type: 'paragraph',
        props: DEFAULT_PROPS,
        content: [
          { type: 'text', text: 'a ', styles: { bold: true } },
          { type: 'text', text: 'x', styles: { code: true } },
          { type: 'text', text: ' ', styles: {} },
          {
            type: 'link',
            href: 'u',
            content: [{ type: 'text', text: 'see ', styles: {} }],
          },
          { type: 'text', text: 'y', styles: { code: true } },
        ],
        children: [],
      },
    ]);
  });

  it('should turn line breaks into newlines and collapse the source newline', () => {
    expect(convertWithoutIds('<p>first<br>\nsecond</p>')).toEqual([
      {
        type: 'paragraph',
        props: DEFAULT_PROPS,
        content: [{ type: 'text', text: 'first\n second', styles: {} }],
        children: [],
      },
    ]);
  });

  it('should convert nested, ordered and task lists', () => {
    expect(
      convertWithoutIds(
        '<ol start="3"><li><p>third</p></li><li><p>fourth</p><ul><li><p>nested</p></li></ul></li></ol><ul><li><input type="checkbox" disabled checked><p>done</p></li></ul>',
      ),
    ).toEqual([
      {
        type: 'numberedListItem',
        props: { ...DEFAULT_PROPS, start: 3 },
        content: [{ type: 'text', text: 'third', styles: {} }],
        children: [],
      },
      {
        type: 'numberedListItem',
        props: DEFAULT_PROPS,
        content: [{ type: 'text', text: 'fourth', styles: {} }],
        children: [
          {
            type: 'bulletListItem',
            props: DEFAULT_PROPS,
            content: [{ type: 'text', text: 'nested', styles: {} }],
            children: [],
          },
        ],
      },
      {
        type: 'checkListItem',
        props: { ...DEFAULT_PROPS, checked: true },
        content: [{ type: 'text', text: 'done', styles: {} }],
        children: [],
      },
    ]);
  });

  it('should convert code blocks, quotes and dividers', () => {
    expect(
      convertWithoutIds(
        '<pre><code data-language="ts">const a = 1;\n\nconst b = &lt;T&gt;a;</code></pre><blockquote><p>quoted</p></blockquote><hr>',
      ),
    ).toEqual([
      {
        type: 'codeBlock',
        props: { language: 'ts' },
        content: [
          { type: 'text', text: 'const a = 1;\n\nconst b = <T>a;', styles: {} },
        ],
        children: [],
      },
      {
        type: 'quote',
        props: { backgroundColor: 'default', textColor: 'default' },
        content: [{ type: 'text', text: 'quoted', styles: {} }],
        children: [],
      },
      { type: 'divider', props: {}, children: [] },
    ]);
  });

  it('should return a single empty paragraph for empty input', () => {
    expect(convertWithoutIds('')).toEqual([
      { type: 'paragraph', props: DEFAULT_PROPS, content: [], children: [] },
    ]);
  });

  it('should give every block a unique uuid', () => {
    const conversion = convertBlockNoteHtmlToBlocks(
      '<p>a</p><ul><li><p>b</p><ul><li><p>c</p></li></ul></li></ul>',
    );

    if (conversion.status !== 'converted') {
      throw new Error('Expected a converted result');
    }

    const ids = [
      conversion.blocks[0].id,
      conversion.blocks[1].id,
      conversion.blocks[1].children[0].id,
    ];

    expect(new Set(ids).size).toBe(3);
    ids.forEach((id) =>
      expect(id).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/,
      ),
    );
  });

  it.each([
    ['an element markdown never emits', '<div><p>hello</p></div>'],
    ['an inline element markdown never emits', '<p>a <b>bold</b></p>'],
    ['an attribute markdown never emits', '<p style="color: red">red</p>'],
    ['an html comment', '<p>a</p><!-- note -->'],
  ])('should report raw html for %s', (_, html) => {
    expect(convertBlockNoteHtmlToBlocks(html)).toEqual({ status: 'raw-html' });
  });

  it.each([
    ['a table', '<table><tbody><tr><td>a</td></tr></tbody></table>'],
    ['an image', '<p><img src="https://example.com/a.png" alt="a"></p>'],
    ['a code block without language', '<pre><code>x</code></pre>'],
    [
      'a quote with several paragraphs',
      '<blockquote><p>a</p><p>b</p></blockquote>',
    ],
    ['whitespace-only content', '<p><code> </code></p>'],
    [
      'a nested list followed by a paragraph',
      '<ul><li><p>a</p><ul><li><p>b</p></li></ul><p>c</p></li></ul>',
    ],
  ])('should report %s as unsupported', (_, html) => {
    expect(convertBlockNoteHtmlToBlocks(html)).toEqual({
      status: 'unsupported',
    });
  });
});
