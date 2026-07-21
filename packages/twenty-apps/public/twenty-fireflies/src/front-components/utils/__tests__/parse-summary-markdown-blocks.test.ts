import { describe, expect, it } from 'vitest';

import { parseSummaryMarkdownBlocks } from 'src/front-components/utils/parse-summary-markdown-blocks.util';

describe('parseSummaryMarkdownBlocks', () => {
  it('should parse headings, paragraphs and lists preserving order', () => {
    expect(
      parseSummaryMarkdownBlocks('## Overview\n\nSome text\n\n- first\n- second'),
    ).toEqual([
      {
        type: 'heading',
        level: 2,
        segments: [{ text: 'Overview', isBold: false }],
      },
      { type: 'paragraph', segments: [{ text: 'Some text', isBold: false }] },
      {
        type: 'list',
        items: [
          [{ text: 'first', isBold: false }],
          [{ text: 'second', isBold: false }],
        ],
      },
    ]);
  });

  it('should flush a trailing list at end of input', () => {
    expect(parseSummaryMarkdownBlocks('- only item')).toEqual([
      { type: 'list', items: [[{ text: 'only item', isBold: false }]] },
    ]);
  });

  it('should return an empty array for empty input', () => {
    expect(parseSummaryMarkdownBlocks('')).toEqual([]);
  });
});
