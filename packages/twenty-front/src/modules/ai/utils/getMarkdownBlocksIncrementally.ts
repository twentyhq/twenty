import { type MarkdownBlockSplitCache } from '@/ai/types/MarkdownBlockSplitCache';
import { Lexer } from 'marked';

// Appended text can reopen the last block or merge a list across a blank line, so the last two re-tokenize.
const UNSTABLE_TRAILING_BLOCK_COUNT = 2;

// marked.lexer normalizes line endings but blockTokens doesn't, which would misalign raw offsets.
const normalizeLineEndings = (text: string): string =>
  text.replace(/\r\n|\r/g, '\n');

const splitIntoBlocks = (text: string): string[] =>
  new Lexer().blockTokens(text, []).map((token) => token.raw);

// A streamed message only grows: settled blocks are reused, and any non-append change fully re-splits.
export const getMarkdownBlocksIncrementally = ({
  text,
  cache,
}: {
  text: string;
  cache: MarkdownBlockSplitCache;
}): { blocks: string[]; cache: MarkdownBlockSplitCache } => {
  const normalizedText = normalizeLineEndings(text);

  if (normalizedText === cache.text) {
    return { blocks: cache.blocks, cache };
  }

  const canReuseStableBlocks =
    cache.stablePrefix.length > 0 &&
    normalizedText.startsWith(cache.stablePrefix);

  const stableBlocks = canReuseStableBlocks ? cache.stableBlocks : [];
  const stablePrefix = canReuseStableBlocks ? cache.stablePrefix : '';

  const tailBlocks = splitIntoBlocks(normalizedText.slice(stablePrefix.length));

  const blocks = [...stableBlocks, ...tailBlocks];
  const nextStableBlocks = blocks.slice(
    0,
    Math.max(0, blocks.length - UNSTABLE_TRAILING_BLOCK_COUNT),
  );
  // The stable set shrinks when the tail collapses into fewer than two blocks.
  const nextStablePrefix =
    nextStableBlocks.length >= stableBlocks.length
      ? stablePrefix + nextStableBlocks.slice(stableBlocks.length).join('')
      : stablePrefix.slice(
          0,
          stablePrefix.length -
            stableBlocks
              .slice(nextStableBlocks.length)
              .reduce((removedLength, raw) => removedLength + raw.length, 0),
        );

  return {
    blocks,
    cache: {
      text: normalizedText,
      blocks,
      stablePrefix: nextStablePrefix,
      stableBlocks: nextStableBlocks,
    },
  };
};
