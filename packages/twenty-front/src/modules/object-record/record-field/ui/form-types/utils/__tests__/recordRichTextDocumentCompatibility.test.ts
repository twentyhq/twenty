import { isDefined, resolveRichTextVariables } from 'twenty-shared/utils';
import { convertTipTapDocumentToBlockNote } from '@/object-record/record-field/ui/form-types/utils/convertTipTapDocumentToBlockNote';
import { parseLegacyRecordRichTextDocument } from '@/object-record/record-field/ui/form-types/utils/parseLegacyRecordRichTextDocument';

describe('record rich-text document compatibility', () => {
  it('projects canonical documents to the legacy content-array shape', () => {
    const content = [
      {
        type: 'paragraph',
        content: [{ type: 'text', text: 'Hello' }],
      },
    ];

    expect(
      JSON.parse(
        convertTipTapDocumentToBlockNote(
          JSON.stringify({
            type: 'doc',
            attrs: { schemaVersion: 1 },
            content,
          }),
        ),
      ),
    ).toEqual([
      {
        type: 'paragraph',
        props: {},
        content: [{ type: 'text', text: 'Hello', styles: {} }],
        children: [],
      },
    ]);
  });

  it('preserves unknown legacy values at the write boundary', () => {
    expect(convertTipTapDocumentToBlockNote('legacy markdown')).toBe(
      'legacy markdown',
    );
  });

  it('reads the legacy content-array shape', () => {
    const content = [{ type: 'paragraph', content: [] }];

    expect(parseLegacyRecordRichTextDocument(JSON.stringify(content))).toEqual({
      type: 'doc',
      content,
    });
  });

  it('normalizes permissive legacy BlockNote string content', () => {
    const content = [
      { type: 'paragraph', content: 'Legacy BlockNote plain content' },
    ];

    expect(parseLegacyRecordRichTextDocument(JSON.stringify(content))).toEqual({
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [{ type: 'text', text: 'Legacy BlockNote plain content' }],
        },
      ],
    });
  });

  it('does not pass malformed legacy blocks to the editor', () => {
    const serializedDocument = JSON.stringify([
      { type: 'paragraph', marks: 'invalid' },
    ]);

    expect(parseLegacyRecordRichTextDocument(serializedDocument)).toEqual({
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [{ type: 'text', text: serializedDocument }],
        },
      ],
    });
  });
});

it('preserves rich formatting and nested lists through the shared editor storage boundary', () => {
  const blocks = [
    {
      type: 'heading',
      props: { level: 2 },
      content: [{ type: 'text', text: 'Title', styles: { bold: true } }],
      children: [],
    },
    {
      type: 'numberedListItem',
      props: {},
      content: [{ type: 'text', text: 'First', styles: {} }],
      children: [],
    },
    {
      type: 'numberedListItem',
      props: {},
      content: [
        {
          type: 'link',
          href: 'https://example.com',
          content: [{ type: 'text', text: 'Second', styles: { italic: true } }],
        },
      ],
      children: [
        {
          type: 'checkListItem',
          props: { checked: true },
          content: [{ type: 'text', text: 'Done', styles: {} }],
          children: [],
        },
      ],
    },
  ];
  const document = parseLegacyRecordRichTextDocument(JSON.stringify(blocks));
  expect(
    JSON.parse(convertTipTapDocumentToBlockNote(JSON.stringify(document))),
  ).toEqual(blocks);
  expect(document).toMatchObject({
    content: [
      { type: 'heading' },
      {
        type: 'orderedList',
        content: [{ type: 'listItem' }, { type: 'listItem' }],
      },
    ],
  });
});

it('preserves workflow variables through the legacy record format', () => {
  const document = {
    type: 'doc',
    content: [
      {
        type: 'paragraph',
        content: [
          { type: 'variableTag', attrs: { variable: '{{step.name}}' } },
        ],
      },
    ],
  };
  const storedValue = convertTipTapDocumentToBlockNote(
    JSON.stringify(document),
  );
  expect(parseLegacyRecordRichTextDocument(storedValue)).toMatchObject(
    document,
  );
});

it.each(['table', 'file', 'mention'])(
  'rejects unsupported legacy %s content instead of silently dropping it',
  (type) => {
    expect(() =>
      parseLegacyRecordRichTextDocument(
        JSON.stringify([{ type, props: {}, content: [] }]),
      ),
    ).toThrow('Unsupported record rich-text content');
  },
);

it('rejects unsupported text colors rather than losing formatting on save', () => {
  expect(() =>
    parseLegacyRecordRichTextDocument(
      JSON.stringify([
        {
          type: 'paragraph',
          props: {},
          content: [
            { type: 'text', text: 'Colored', styles: { textColor: 'red' } },
          ],
        },
      ]),
    ),
  ).toThrow('Unsupported record rich-text content');
});

it('recognizes styled BlockNote text even when optional block props are absent', () => {
  expect(
    parseLegacyRecordRichTextDocument(
      JSON.stringify([
        {
          type: 'paragraph',
          content: [{ type: 'text', text: 'Bold', styles: { bold: true } }],
        },
      ]),
    ),
  ).toMatchObject({
    type: 'doc',
    content: [
      {
        type: 'paragraph',
        content: [{ type: 'text', text: 'Bold', marks: [{ type: 'bold' }] }],
      },
    ],
  });
});

it.each(['left', 'center', 'right'])(
  'preserves %s image alignment',
  (align) => {
    const document = {
      type: 'doc',
      content: [
        {
          type: 'image',
          attrs: {
            src: 'https://example.com/image.png',
            align,
            alt: '',
            title: '',
            width: null,
          },
        },
      ],
    };
    const stored = convertTipTapDocumentToBlockNote(JSON.stringify(document));
    expect(JSON.parse(stored)[0].props.textAlignment).toBe(align);
    expect(parseLegacyRecordRichTextDocument(stored)).toEqual(document);
  },
);

it('preserves literal mustache text when variables are disabled', () => {
  const blocks = [
    {
      type: 'paragraph',
      props: {},
      content: [{ type: 'text', text: 'Use {{name}} here', styles: {} }],
    },
  ];
  expect(
    parseLegacyRecordRichTextDocument(JSON.stringify(blocks), false),
  ).toMatchObject({
    content: [{ content: [{ type: 'text', text: 'Use {{name}} here' }] }],
  });
  expect(
    parseLegacyRecordRichTextDocument('Use {{name}} here', false),
  ).toMatchObject({
    content: [{ content: [{ type: 'text', text: 'Use {{name}} here' }] }],
  });
});

it('keeps workflow variables resolvable without resolving literal mustache text', () => {
  const content = [
    {
      type: 'paragraph',
      content: [
        { type: 'text', text: 'Literal {{step.name}} ' },
        { type: 'variableTag', attrs: { variable: '{{step.name}}' } },
      ],
    },
  ];
  const stored = convertTipTapDocumentToBlockNote(
    JSON.stringify({ type: 'doc', content }),
    true,
  );
  expect(JSON.parse(stored)).toEqual(content);
  const resolved = resolveRichTextVariables(stored, {
    step: { name: 'Alice' },
  });
  if (!isDefined(resolved)) {
    throw new Error('Expected resolved rich text');
  }
  expect(JSON.parse(resolved)).toEqual([
    {
      type: 'paragraph',
      content: [
        { type: 'text', text: 'Literal {{step.name}} ' },
        { type: 'text', text: 'Alice' },
      ],
    },
  ]);
});
