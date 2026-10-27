import { stripRichTextFileUrlTokens } from '@/object-record/record-field/ui/utils/stripRichTextFileUrlTokens';

const buildDocument = (content: unknown[]) =>
  JSON.stringify({ type: 'doc', attrs: { schemaVersion: 1 }, content });

describe('stripRichTextFileUrlTokens', () => {
  it('should remove the token from image and file urls', () => {
    const result = stripRichTextFileUrlTokens(
      buildDocument([
        {
          type: 'image',
          attrs: {
            src: 'https://example.com/files/image.png?token=abc&size=2',
            alt: 'image.png',
          },
        },
        {
          type: 'file',
          attrs: {
            url: 'https://example.com/files/report.pdf?token=def',
            name: 'report.pdf',
          },
        },
      ]),
    );

    expect(JSON.parse(result).content).toEqual([
      {
        type: 'image',
        attrs: {
          src: 'https://example.com/files/image.png?size=2',
          alt: 'image.png',
        },
      },
      {
        type: 'file',
        attrs: {
          url: 'https://example.com/files/report.pdf',
          name: 'report.pdf',
        },
      },
    ]);
  });

  it('should strip nested files and leave links untouched', () => {
    const result = stripRichTextFileUrlTokens(
      buildDocument([
        {
          type: 'blockquote',
          content: [
            {
              type: 'image',
              attrs: { src: 'https://example.com/a.png?token=abc' },
            },
            {
              type: 'paragraph',
              content: [
                {
                  type: 'text',
                  text: 'link',
                  marks: [
                    {
                      type: 'link',
                      attrs: { href: 'https://example.com/page?token=keep' },
                    },
                  ],
                },
              ],
            },
          ],
        },
      ]),
    );

    const [blockquote] = JSON.parse(result).content;

    expect(blockquote.content[0].attrs.src).toBe('https://example.com/a.png');
    expect(blockquote.content[1].content[0].marks[0].attrs.href).toBe(
      'https://example.com/page?token=keep',
    );
  });

  it('should keep relative urls as they are', () => {
    const result = stripRichTextFileUrlTokens(
      buildDocument([
        { type: 'image', attrs: { src: '/files/a.png?token=x' } },
      ]),
    );

    expect(JSON.parse(result).content[0].attrs.src).toBe(
      '/files/a.png?token=x',
    );
  });

  it('should return the input unchanged when it is not a TipTap document', () => {
    expect(stripRichTextFileUrlTokens('plain markdown')).toBe('plain markdown');
    expect(stripRichTextFileUrlTokens('[{"type":"paragraph"}]')).toBe(
      '[{"type":"paragraph"}]',
    );
  });
});
