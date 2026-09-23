import { resolveRichTextVariables } from 'twenty-shared/utils';
import { convertTipTapDocumentToBlockNote } from '@/object-record/record-field/ui/form-types/utils/convertTipTapDocumentToBlockNote';
import { parseLegacyRecordRichTextDocument } from '@/object-record/record-field/ui/form-types/utils/parseLegacyRecordRichTextDocument';
import { serializeTipTapDocumentContent } from '@/object-record/record-field/ui/form-types/utils/serializeTipTapDocumentContent';

const readBlockNote = (blocks: unknown[]) =>
  parseLegacyRecordRichTextDocument({
    serializedDocument: JSON.stringify(blocks),
    enableVariables: false,
  });

const writeBlockNote = (document: unknown) =>
  JSON.parse(convertTipTapDocumentToBlockNote(JSON.stringify(document)));

const text = (value: string) => ({ type: 'text', text: value, styles: {} });

const MALFORMED_BLOCKS = JSON.stringify([
  { type: 'paragraph', marks: 'invalid' },
]);

describe('record rich-text document compatibility', () => {
  it.each([
    {
      name: 'headings, marks, links and nested lists',
      blocks: [
        {
          type: 'heading',
          props: { level: 2 },
          content: [{ ...text('Title'), styles: { bold: true } }],
          children: [],
        },
        {
          type: 'numberedListItem',
          props: {},
          content: [
            {
              type: 'link',
              href: 'https://example.com',
              content: [{ ...text('Link'), styles: { italic: true } }],
            },
          ],
          children: [
            {
              type: 'checkListItem',
              props: { checked: true },
              content: [text('Done')],
              children: [],
            },
          ],
        },
      ],
    },
    {
      name: 'the start number of an ordered list',
      blocks: [
        {
          type: 'numberedListItem',
          props: { start: 3 },
          content: [text('Third')],
          children: [],
        },
        {
          type: 'numberedListItem',
          props: {},
          content: [text('Fourth')],
          children: [],
        },
      ],
    },
    {
      name: 'an aligned image and the caption the editor does not display',
      blocks: [
        {
          type: 'image',
          props: {
            url: 'https://example.com/image.png',
            textAlignment: 'center',
            caption: 'Quarterly chart',
            name: 'chart.png',
            previewWidth: 320,
          },
          children: [],
        },
      ],
    },
  ])('keeps $name through the shared editor', ({ blocks }) => {
    expect(writeBlockNote(readBlockNote(blocks))).toEqual(blocks);
  });

  it.each([
    {
      name: 'a TipTap content array',
      stored: JSON.stringify([{ type: 'paragraph', content: [] }]),
      enableVariables: false,
      expected: { type: 'doc', content: [{ type: 'paragraph', content: [] }] },
    },
    {
      name: 'BlockNote string content',
      stored: JSON.stringify([{ type: 'paragraph', content: 'Plain' }]),
      enableVariables: false,
      expected: { content: [{ content: [{ type: 'text', text: 'Plain' }] }] },
    },
    {
      name: 'styled BlockNote text without block props',
      stored: JSON.stringify([
        {
          type: 'paragraph',
          content: [{ ...text('Bold'), styles: { bold: true } }],
        },
      ]),
      enableVariables: false,
      expected: {
        content: [{ content: [{ text: 'Bold', marks: [{ type: 'bold' }] }] }],
      },
    },
    {
      name: 'malformed blocks as plain text',
      stored: MALFORMED_BLOCKS,
      enableVariables: false,
      expected: { content: [{ content: [{ text: MALFORMED_BLOCKS }] }] },
    },
    {
      name: 'mustache text literally when variables are disabled',
      stored: JSON.stringify([
        { type: 'paragraph', props: {}, content: [text('Use {{name}}')] },
      ]),
      enableVariables: false,
      expected: { content: [{ content: [{ text: 'Use {{name}}' }] }] },
    },
    {
      name: 'plain mustache text literally when variables are disabled',
      stored: 'Use {{name}}',
      enableVariables: false,
      expected: { content: [{ content: [{ text: 'Use {{name}}' }] }] },
    },
    {
      name: 'mustache text as a variable when variables are enabled',
      stored: JSON.stringify([
        { type: 'paragraph', props: {}, content: [text('{{step.name}}')] },
      ]),
      enableVariables: true,
      expected: {
        content: [
          {
            content: [
              { type: 'variableTag', attrs: { variable: '{{step.name}}' } },
            ],
          },
        ],
      },
    },
  ])('reads $name', ({ stored, enableVariables, expected }) => {
    expect(
      parseLegacyRecordRichTextDocument({
        serializedDocument: stored,
        enableVariables,
      }),
    ).toMatchObject(expected);
  });

  it.each([
    { name: 'tables', block: { type: 'table', props: {} } },
    { name: 'files', block: { type: 'file', props: {} } },
    { name: 'mentions', block: { type: 'mention', props: {} } },
    {
      name: 'text colors',
      block: {
        type: 'paragraph',
        props: {},
        content: [{ ...text('Red'), styles: { textColor: 'red' } }],
      },
    },
    {
      name: 'toggle headings',
      block: { type: 'heading', props: { level: 2, isToggleable: true } },
    },
    {
      name: 'images shown as files',
      block: { type: 'image', props: { url: 'image.png', showPreview: false } },
    },
  ])('refuses $name rather than dropping them on save', ({ block }) => {
    expect(() => readBlockNote([block])).toThrow(
      'Unsupported record rich-text content',
    );
  });

  it('keeps values it cannot parse unchanged on save', () => {
    expect(convertTipTapDocumentToBlockNote('legacy markdown')).toBe(
      'legacy markdown',
    );
  });

  it('separates adjacent ordered lists so BlockNote does not merge them', () => {
    const orderedList = (value: string) => ({
      type: 'orderedList',
      attrs: { start: 1 },
      content: [
        {
          type: 'listItem',
          content: [{ type: 'paragraph', content: [text(value)] }],
        },
      ],
    });

    const blocks = writeBlockNote({
      type: 'doc',
      content: [orderedList('First'), orderedList('Restarted')],
    });

    expect(blocks.map((block: { type: string }) => block.type)).toEqual([
      'numberedListItem',
      'paragraph',
      'numberedListItem',
    ]);
  });

  it('continues a numbered list whose next item carries a start, as BlockNote renders it', () => {
    expect(
      readBlockNote([
        { type: 'numberedListItem', props: {}, content: [text('First')] },
        {
          type: 'numberedListItem',
          props: { start: 1 },
          content: [text('Second')],
        },
      ]),
    ).toMatchObject({
      content: [{ type: 'orderedList', content: [{}, {}] }],
    });
  });

  it.each([
    {
      name: 'styled text',
      inline: { ...text('{{step.name}}'), styles: { bold: true } },
    },
    {
      name: 'a link',
      inline: {
        type: 'link',
        href: 'https://example.com',
        content: [text('{{step.name}}')],
      },
    },
  ])('keeps variables read from $name resolvable', ({ inline }) => {
    const document = parseLegacyRecordRichTextDocument({
      serializedDocument: JSON.stringify([
        { type: 'paragraph', props: {}, content: [inline] },
      ]),
      enableVariables: true,
    });

    expect(
      resolveRichTextVariables(
        serializeTipTapDocumentContent(JSON.stringify(document)),
        { step: { name: 'Alice' } },
      ),
    ).not.toContain('variableTag');
  });

  it('keeps workflow variables resolvable without resolving literal mustache text', () => {
    const stored = serializeTipTapDocumentContent(
      JSON.stringify({
        type: 'doc',
        content: [
          {
            type: 'paragraph',
            content: [
              { type: 'text', text: 'Literal {{step.name}} ' },
              { type: 'variableTag', attrs: { variable: '{{step.name}}' } },
            ],
          },
        ],
      }),
    );

    expect(resolveRichTextVariables(stored, { step: { name: 'Alice' } })).toBe(
      JSON.stringify([
        {
          type: 'paragraph',
          content: [
            { type: 'text', text: 'Literal {{step.name}} ' },
            { type: 'text', text: 'Alice' },
          ],
        },
      ]),
    );
  });
});
