import { marked } from 'marked';

import { EMPTY_MARKDOWN_BLOCK_SPLIT_CACHE } from '@/ai/constants/EmptyMarkdownBlockSplitCache';
import { type MarkdownBlockSplitCache } from '@/ai/types/MarkdownBlockSplitCache';
import { getMarkdownBlocksIncrementally } from '@/ai/utils/getMarkdownBlocksIncrementally';

const lexerBlocks = (text: string): string[] =>
  marked.lexer(text).map((token) => token.raw);

const streamThrough = (text: string, chunkSize: number): string[] => {
  let cache: MarkdownBlockSplitCache = EMPTY_MARKDOWN_BLOCK_SPLIT_CACHE;
  let blocks: string[] = [];

  for (let end = chunkSize; end < text.length + chunkSize; end += chunkSize) {
    const result = getMarkdownBlocksIncrementally({
      text: text.slice(0, Math.min(end, text.length)),
      cache,
    });

    cache = result.cache;
    blocks = result.blocks;
  }

  return blocks;
};

const FIXTURES: Record<string, string> = {
  paragraphs: 'First paragraph.\n\nSecond paragraph.\n\nThird paragraph.',
  looseList: '- a\n\n- b\n\n- c\n\nplain paragraph after list',
  listWithLooseContinuation:
    '- item one\n\n  continued loose content\n\n- item two',
  nestedList: '1. first\n   - sub a\n\n   - sub b\n2. second',
  table: '| a | b |\n|---|---|\n| 1 | 2 |\n| 3 | 4 |\n\nafter table',
  codeFence: 'before\n\n```js\nconst x = 1;\n\nconst y = 2;\n```\n\nafter',
  unclosedCodeFence: 'before\n\n```js\nconst x = 1;\n\nstill code',
  setextHeading: 'Title\n=====\n\nBody text\n\nSub\n-----\n\nmore',
  mixedBlocks:
    '# H1\n\ntext\n\n## H2\n\n- list\n- items\n\n> quote\n> more quote\n\nend',
  blockquotes: '> a\n\n> b\n\ntext',
  chatReferences:
    'Check [[field:12345678-1234-5678-abcd-123456789012:Annual Revenue[[/field]] and\n\n- [[view:12345678-1234-5678-abcd-123456789012:All[[/view]]\n\n| [[object:company:Companies[[/object]] | x |\n|---|---|\n| a | b |',
  windowsLineEndings: 'line one\r\n\r\n- a\r\n\r\n- b\r\n\r\nend',
};

describe('getMarkdownBlocksIncrementally', () => {
  it.each(Object.entries(FIXTURES))(
    'should match a full marked.lexer split when streamed char by char for %s',
    (_name, text) => {
      let cache: MarkdownBlockSplitCache = EMPTY_MARKDOWN_BLOCK_SPLIT_CACHE;

      for (let end = 1; end <= text.length; end++) {
        const prefix = text.slice(0, end);
        const result = getMarkdownBlocksIncrementally({ text: prefix, cache });

        cache = result.cache;

        expect(result.blocks).toEqual(lexerBlocks(prefix));
      }
    },
  );

  it.each(Object.entries(FIXTURES))(
    'should match a full marked.lexer split when streamed in chunks for %s',
    (_name, text) => {
      for (const chunkSize of [3, 7, 20]) {
        expect(streamThrough(text, chunkSize)).toEqual(lexerBlocks(text));
      }
    },
  );

  it('should return the cached blocks when the text is unchanged', () => {
    const text = 'A paragraph.\n\nAnother paragraph.';
    const firstResult = getMarkdownBlocksIncrementally({
      text,
      cache: EMPTY_MARKDOWN_BLOCK_SPLIT_CACHE,
    });
    const secondResult = getMarkdownBlocksIncrementally({
      text,
      cache: firstResult.cache,
    });

    expect(secondResult.blocks).toBe(firstResult.blocks);
    expect(secondResult.cache).toBe(firstResult.cache);
  });

  it('should recover with a full split when the text is not an append', () => {
    const firstResult = getMarkdownBlocksIncrementally({
      text: 'First paragraph.\n\nSecond paragraph.\n\nThird one.',
      cache: EMPTY_MARKDOWN_BLOCK_SPLIT_CACHE,
    });

    const replacedText = 'Completely different text.\n\nWith new blocks.';
    const secondResult = getMarkdownBlocksIncrementally({
      text: replacedText,
      cache: firstResult.cache,
    });

    expect(secondResult.blocks).toEqual(lexerBlocks(replacedText));
  });

  it('should handle an empty text', () => {
    const result = getMarkdownBlocksIncrementally({
      text: '',
      cache: EMPTY_MARKDOWN_BLOCK_SPLIT_CACHE,
    });

    expect(result.blocks).toEqual([]);
  });
});
