import { type EmailDocument } from 'twenty-shared/utils';

import { resolveEmailDocumentBindings } from 'src/engine/core-modules/email/utils/resolve-email-document-bindings.util';

describe('resolveEmailDocumentBindings', () => {
  it('should resolve every authored string slot without mutating the source', () => {
    const source = {
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [
            { type: 'text', text: 'Hello {{name}}: {{message}}' },
            {
              type: 'variableTag',
              attrs: { variable: '{{message}}' },
              marks: [{ type: 'bold' }],
            },
            {
              type: 'text',
              text: 'link',
              marks: [
                {
                  type: 'link',
                  attrs: { href: 'https://example.com/{{id}}' },
                },
              ],
            },
          ],
        },
        {
          type: 'image',
          attrs: {
            src: 'https://example.com/{{id}}.png',
            href: 'https://example.com/{{id}}',
            alt: 'Portrait of {{name}}',
          },
        },
        {
          type: 'html',
          attrs: { html: '<p>{{name}}</p>' },
        },
      ],
    } satisfies EmailDocument;
    const snapshot = structuredClone(source);
    const values: Record<string, string> = {
      '{{name}}': 'Ada',
      '{{message}}': 'first\nsecond',
      '{{id}}': 'person-1',
    };

    const resolved = resolveEmailDocumentBindings(source, (value) =>
      Object.entries(values).reduce(
        (result, [binding, replacement]) =>
          result.split(binding).join(replacement),
        value,
      ),
    );

    expect(source).toEqual(snapshot);
    expect(resolved).toEqual({
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [
            { type: 'text', text: 'Hello Ada: first' },
            { type: 'hardBreak' },
            { type: 'text', text: 'second' },
            { type: 'text', text: 'first', marks: [{ type: 'bold' }] },
            { type: 'hardBreak', marks: [{ type: 'bold' }] },
            { type: 'text', text: 'second', marks: [{ type: 'bold' }] },
            {
              type: 'text',
              text: 'link',
              marks: [
                {
                  type: 'link',
                  attrs: { href: 'https://example.com/person-1' },
                },
              ],
            },
          ],
        },
        {
          type: 'image',
          attrs: {
            src: 'https://example.com/person-1.png',
            href: 'https://example.com/person-1',
            alt: 'Portrait of Ada',
          },
        },
        { type: 'html', attrs: { html: '<p>Ada</p>' } },
      ],
    });
  });

  it('should keep resolved values inert', () => {
    const source = {
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [
            { type: 'variableTag', attrs: { variable: '{{message}}' } },
          ],
        },
      ],
    } satisfies EmailDocument;
    const values: Record<string, string> = {
      '{{message}}': '{{secret}}',
      '{{secret}}': 'leaked',
    };

    const resolved = resolveEmailDocumentBindings(source, (value) =>
      value.replace(/\{\{[^{}]+\}\}/g, (binding) => values[binding] ?? ''),
    );

    expect(resolved.content?.[0].content).toEqual([
      { type: 'text', text: '{{secret}}' },
    ]);
  });

  it('should preserve unresolved variable placeholders and omit empty text', () => {
    const source = {
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [
            { type: 'variableTag', attrs: { variable: null } },
            { type: 'text', text: '{{empty}}' },
          ],
        },
      ],
    } satisfies EmailDocument;

    const resolved = resolveEmailDocumentBindings(source, (value) =>
      value.replace('{{empty}}', ''),
    );

    expect(resolved.content?.[0].content).toEqual([
      { type: 'variableTag', attrs: { variable: null } },
    ]);
  });
});
