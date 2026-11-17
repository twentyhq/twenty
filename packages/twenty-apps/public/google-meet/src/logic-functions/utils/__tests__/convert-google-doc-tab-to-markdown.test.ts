import { describe, expect, it } from 'vitest';

import { convertGoogleDocTabToMarkdown } from 'src/logic-functions/utils/convert-google-doc-tab-to-markdown.util';

const text = (content: string) => ({ textRun: { content } });

describe('convertGoogleDocTabToMarkdown', () => {
  it('should convert headings, paragraphs and nested bullets of Gemini notes', () => {
    expect(
      convertGoogleDocTabToMarkdown({
        documentTab: {
          lists: {
            bullets: {
              listProperties: { nestingLevels: [{}, {}] },
            },
          },
          body: {
            content: [
              {
                paragraph: {
                  elements: [text('Summary\n')],
                  paragraphStyle: { namedStyleType: 'HEADING_2' },
                },
              },
              { paragraph: { elements: [text('\n')] } },
              {
                paragraph: {
                  elements: [
                    { person: { personProperties: { name: 'Alice Martin' } } },
                    text(' presented the roadmap.\n'),
                  ],
                },
              },
              {
                paragraph: {
                  elements: [
                    text('Pricing'),
                    text(': agreed on annual plans.\n'),
                  ],
                  bullet: { listId: 'bullets' },
                },
              },
              {
                paragraph: {
                  elements: [text('Starts in January.\n')],
                  bullet: { listId: 'bullets', nestingLevel: 1 },
                },
              },
              {
                paragraph: {
                  elements: [text('Next steps\n')],
                  paragraphStyle: { namedStyleType: 'HEADING_2' },
                },
              },
            ],
          },
        },
      }),
    ).toBe(
      '## Summary\n\nAlice Martin presented the roadmap.\n\n- Pricing: agreed on annual plans.\n  - Starts in January.\n\n## Next steps',
    );
  });

  it('should number items of an ordered list', () => {
    expect(
      convertGoogleDocTabToMarkdown({
        documentTab: {
          lists: {
            numbered: {
              listProperties: { nestingLevels: [{ glyphType: 'DECIMAL' }] },
            },
          },
          body: {
            content: [
              {
                paragraph: {
                  elements: [text('Send the contract\n')],
                  bullet: { listId: 'numbered' },
                },
              },
              {
                paragraph: {
                  elements: [text('Book the kickoff\n')],
                  bullet: { listId: 'numbered' },
                },
              },
            ],
          },
        },
      }),
    ).toBe('1. Send the contract\n1. Book the kickoff');
  });

  it('should keep bold, italic, links and smart chips', () => {
    expect(
      convertGoogleDocTabToMarkdown({
        documentTab: {
          body: {
            content: [
              {
                paragraph: {
                  elements: [
                    {
                      textRun: { content: 'Owner ', textStyle: { bold: true } },
                    },
                    {
                      textRun: {
                        content: 'maybe',
                        textStyle: { italic: true },
                      },
                    },
                    text(' see '),
                    {
                      textRun: {
                        content: 'the deck',
                        textStyle: {
                          link: { url: 'https://example.com/deck' },
                        },
                      },
                    },
                    text(' and '),
                    {
                      richLink: {
                        richLinkProperties: {
                          title: 'Transcript',
                          uri: 'https://docs.google.com/document/d/first',
                        },
                      },
                    },
                    text('\n'),
                  ],
                },
              },
            ],
          },
        },
      }),
    ).toBe(
      '**Owner** _maybe_ see [the deck](https://example.com/deck) and [Transcript](https://docs.google.com/document/d/first)',
    );
  });

  it('should return an empty string for a tab without text', () => {
    expect(convertGoogleDocTabToMarkdown({})).toBe('');
  });
});
