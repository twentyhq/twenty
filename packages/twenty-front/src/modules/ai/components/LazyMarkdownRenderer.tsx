import {
  StyledMarkdownContainer,
  StyledSkeletonContainer,
} from '@/ai/components/LazyMarkdownRendererStyledComponents';
import { MarkdownRenderer } from '@/ai/components/MarkdownRenderer';
import { EMPTY_MARKDOWN_BLOCK_SPLIT_CACHE } from '@/ai/constants/EmptyMarkdownBlockSplitCache';
import { getMarkdownBlocksIncrementally } from '@/ai/utils/getMarkdownBlocksIncrementally';
import { protectChatReferencesForMarkdown } from '@/ai/utils/protectChatReferencesForMarkdown';
import { memo, Suspense, useRef } from 'react';
import { Skeleton, SKELETON_HEIGHT_SIZES } from 'twenty-ui/primitives/feedback';

export const MarkdownLoadingSkeleton = () => {
  return (
    <StyledSkeletonContainer>
      <Skeleton width={200} height={SKELETON_HEIGHT_SIZES.s} />
    </StyledSkeletonContainer>
  );
};

// Memoized per block so only the streaming tail re-parses references on each flush.
const MemoizedMarkdownBlock = memo(
  ({ blockText, noImage }: { blockText: string; noImage?: boolean }) => (
    <MarkdownRenderer noImage={noImage}>
      {protectChatReferencesForMarkdown(blockText)}
    </MarkdownRenderer>
  ),
);

type LazyMarkdownContentProps = {
  text: string;
  noImage?: boolean;
};

export const LazyMarkdownContent = ({
  text,
  noImage,
}: LazyMarkdownContentProps) => {
  // Not state: only caches the previous split so streaming appends skip settled blocks.
  // oxlint-disable-next-line twenty/no-state-useref
  const blockSplitCacheRef = useRef(EMPTY_MARKDOWN_BLOCK_SPLIT_CACHE);

  const { blocks: markdownBlocks, cache } = getMarkdownBlocksIncrementally({
    text,
    cache: blockSplitCacheRef.current,
  });

  blockSplitCacheRef.current = cache;

  return (
    <StyledMarkdownContainer
      className="markdown-section"
      data-replay-ignore-mutations="true"
    >
      {markdownBlocks.map((blockText, blockIndex) => (
        <MemoizedMarkdownBlock
          key={blockIndex}
          blockText={blockText}
          noImage={noImage}
        />
      ))}
    </StyledMarkdownContainer>
  );
};

type LazyMarkdownRendererProps = LazyMarkdownContentProps;

export const LazyMarkdownRenderer = ({
  text,
  noImage,
}: LazyMarkdownRendererProps) => (
  <Suspense fallback={<MarkdownLoadingSkeleton />}>
    <LazyMarkdownContent text={text} noImage={noImage} />
  </Suspense>
);
