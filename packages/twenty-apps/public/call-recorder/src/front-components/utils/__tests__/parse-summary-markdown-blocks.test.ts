import { describe, expect, it } from 'vitest';

import { parseSummaryMarkdownBlocks } from 'src/front-components/utils/parse-summary-markdown-blocks.util';

describe('parseSummaryMarkdownBlocks', () => {
  it('parses headings with their level', () => {
    expect(parseSummaryMarkdownBlocks('## Overview')).toEqual([
      {
        type: 'heading',
        level: 2,
        segments: [{ text: 'Overview', isBold: false }],
      },
    ]);
  });

  it('groups consecutive bullet lines into a single list block', () => {
    expect(parseSummaryMarkdownBlocks('- First\n- Second')).toEqual([
      {
        type: 'list',
        items: [
          [{ text: 'First', isBold: false }],
          [{ text: 'Second', isBold: false }],
        ],
      },
    ]);
  });

  it('closes the open list when a heading or paragraph follows', () => {
    expect(parseSummaryMarkdownBlocks('- Item\nParagraph after')).toEqual([
      { type: 'list', items: [[{ text: 'Item', isBold: false }]] },
      {
        type: 'paragraph',
        segments: [{ text: 'Paragraph after', isBold: false }],
      },
    ]);
  });

  it('keeps bold segments inside headings and bullets', () => {
    expect(parseSummaryMarkdownBlocks('**Alex**\n- Send the deck')).toEqual([
      { type: 'paragraph', segments: [{ text: 'Alex', isBold: true }] },
      { type: 'list', items: [[{ text: 'Send the deck', isBold: false }]] },
    ]);
  });

  it('ignores blank lines and separates blocks by them', () => {
    expect(parseSummaryMarkdownBlocks('## Gist\n\nA one-line recap.')).toEqual([
      {
        type: 'heading',
        level: 2,
        segments: [{ text: 'Gist', isBold: false }],
      },
      {
        type: 'paragraph',
        segments: [{ text: 'A one-line recap.', isBold: false }],
      },
    ]);
  });

  it('returns no blocks for empty or whitespace-only markdown', () => {
    expect(parseSummaryMarkdownBlocks('')).toEqual([]);
    expect(parseSummaryMarkdownBlocks('\n   \n')).toEqual([]);
  });
});
