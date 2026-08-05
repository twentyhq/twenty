import { type MarkdownBlockSplitCache } from '@/ai/types/MarkdownBlockSplitCache';
import { Lexer } from 'marked';

// Appended text can reopen the last block, and a list followed by a blank-line
// token merges with a later item ("- a\n\n" + "- b" is one loose list), so the
// two trailing blocks must be re-tokenized on every flush. Anything before them
// was terminated by content that is still present, so it can never change.
const UNSTABLE_TRAILING_BLOCK_COUNT = 2;

// marked.lexer normalizes line endings before tokenizing; blockTokens does not,
// so normalize here to keep raw offsets aligned with the sliced text.
const normalizeLineEndings = (text: string): string =>
  text.replace(/\r\n|\r/g, '\n');

const splitIntoBlocks = (text: string): string[] =>
  new Lexer().blockTokens(text, []).map((token) => token.raw);

// A streamed message only grows, so instead of re-tokenizing the whole message
// on every flush, reuse the blocks that can no longer change and re-tokenize
// only the unstable tail, keeping each flush O(appended text) instead of
// O(whole message). Any non-append change misses the stablePrefix guard and
// falls back to a full split.
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
  // Append newly stabilized raws instead of re-joining the whole prefix on
  // every flush. The stable set shrinks when the tail collapses into fewer
  // than two blocks; then trim the raws that fell out of it.
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
