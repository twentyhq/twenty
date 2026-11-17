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
      '## Summary\n\nAlice Martin presented the roadmap.\n\n- Pricing: agreed on annual plans.\n    - Starts in January.\n\n## Next steps',
    );
  });

  it('should number items of an ordered list and nest numbered children', () => {
    expect(
      convertGoogleDocTabToMarkdown({
        documentTab: {
          lists: {
            numbered: {
              listProperties: {
                nestingLevels: [
                  { glyphType: 'DECIMAL' },
                  { glyphType: 'ALPHA' },
                ],
              },
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
                  elements: [text('Draft the terms\n')],
                  bullet: { listId: 'numbered', nestingLevel: 1 },
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
    ).toBe('1. Send the contract\n    1. Draft the terms\n1. Book the kickoff');
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
      '**Owner** *maybe* see [the deck](https://example.com/deck) and [Transcript](https://docs.google.com/document/d/first)',
    );
  });

  it('should keep one emphasis span across pieces Google styles separately', () => {
    expect(
      convertGoogleDocTabToMarkdown({
        documentTab: {
          body: {
            content: [
              {
                paragraph: {
                  elements: [
                    {
                      textRun: {
                        content: 'Please ',
                        textStyle: { italic: true },
                      },
                    },
                    {
                      textRun: {
                        content: 'rate the notes',
                        textStyle: { italic: true, bold: true },
                      },
                    },
                    {
                      textRun: {
                        content: ' in a ',
                        textStyle: { italic: true },
                      },
                    },
                    {
                      textRun: {
                        content: 'short survey',
                        textStyle: {
                          italic: true,
                          link: { url: 'https://example.com/survey' },
                        },
                      },
                    },
                    {
                      textRun: { content: '.\n', textStyle: { italic: true } },
                    },
                  ],
                },
              },
            ],
          },
        },
      }),
    ).toBe(
      '*Please **rate the notes** in a [short survey](https://example.com/survey).*',
    );
  });

  it('should escape characters that Markdown would read as formatting', () => {
    expect(
      convertGoogleDocTabToMarkdown({
        documentTab: {
          body: {
            content: [
              {
                paragraph: {
                  elements: [
                    text('Use *value* or [name] as the_placeholder\n'),
                  ],
                },
              },
            ],
          },
        },
      }),
    ).toBe('Use \\*value\\* or \\[name\\] as the\\_placeholder');
  });

  it('should return an empty string for a tab without text', () => {
    expect(convertGoogleDocTabToMarkdown({})).toBe('');
  });
});
