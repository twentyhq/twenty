import { SkeletonLine } from '@/ui/feedback/skeleton/components/SkeletonLine';
import {
  StyledMarkdownContainer,
  StyledSkeletonContainer,
} from '@/ai-chat/message-content/components/LazyMarkdownRendererStyledComponents';
import { MarkdownRenderer } from '@/ai-chat/message-content/components/MarkdownRenderer';
import { EMPTY_MARKDOWN_BLOCK_SPLIT_CACHE } from '@/ai-chat/message-content/constants/EmptyMarkdownBlockSplitCache';
import { type MarkdownDisplayMode } from '@/ai-chat/message-content/types/MarkdownDisplayMode';
import { getMarkdownBlocksIncrementally } from '@/ai-chat/message-content/utils/getMarkdownBlocksIncrementally';
import { protectChatReferencesForMarkdown } from '@/ai-chat/message-content/utils/protectChatReferencesForMarkdown';
import { memo, Suspense, useRef } from 'react';
import { SKELETON_HEIGHT_SIZES } from 'twenty-ui/primitives/feedback';
import { themeCssVariables } from 'twenty-ui/theme';

export const MarkdownLoadingSkeleton = () => {
  return (
    <StyledSkeletonContainer>
      <SkeletonLine
        borderRadius={themeCssVariables.border.radius.smRound}
        width={200}
        height={SKELETON_HEIGHT_SIZES.s}
      />
    </StyledSkeletonContainer>
  );
};

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
  displayMode?: MarkdownDisplayMode;
};

export const LazyMarkdownContent = ({
  text,
  noImage,
  displayMode = 'default',
}: LazyMarkdownContentProps) => {
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
      displayMode={displayMode}
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
  displayMode,
}: LazyMarkdownRendererProps) => (
  <Suspense fallback={<MarkdownLoadingSkeleton />}>
    <LazyMarkdownContent
      text={text}
      noImage={noImage}
      displayMode={displayMode}
    />
  </Suspense>
);
