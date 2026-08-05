import { SKELETON_LOADER_HEIGHT_SIZES } from '@/activities/components/SkeletonLoader';
import {
  StyledMarkdownContainer,
  StyledParagraph,
  StyledSkeletonContainer,
  StyledTableScrollContainer,
} from '@/ai/components/LazyMarkdownRendererStyledComponents';
import { MarkdownCodeBlock } from '@/ai/components/MarkdownCodeBlock';
import { TextWithChatReferences } from '@/ai/components/TextWithChatReferences';
import {
  EMPTY_MARKDOWN_BLOCK_SPLIT_CACHE,
  getMarkdownBlocksIncrementally,
} from '@/ai/utils/getMarkdownBlocksIncrementally';
import { protectChatReferencesForMarkdown } from '@/ai/utils/protectChatReferencesForMarkdown';
import {
  cloneElement,
  isValidElement,
  lazy,
  memo,
  Suspense,
  useContext,
  useRef,
} from 'react';
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';
import { getSafeUrl, isDefined } from 'twenty-shared/utils';
import { ThemeContext } from 'twenty-ui/theme-constants';

const processChildrenForChatReferences = (
  children: React.ReactNode,
): React.ReactNode => {
  if (typeof children === 'string') {
    return <TextWithChatReferences text={children} />;
  }

  if (Array.isArray(children)) {
    return children.map((child, index) => (
      <span key={index}>{processChildrenForChatReferences(child)}</span>
    ));
  }

  if (isValidElement<{ children?: React.ReactNode }>(children)) {
    const childProps = children.props;

    if (isDefined(childProps.children)) {
      return cloneElement(children, {
        children: processChildrenForChatReferences(childProps.children),
      });
    }
  }

  return children;
};

const createChatReferenceElement =
  (Element: React.ElementType) =>
  ({ children }: { children?: React.ReactNode }) => (
    <Element>{processChildrenForChatReferences(children)}</Element>
  );

// react-markdown uses each entry as the JSX element type, so rebuilding this map
// per render would remount every node on every streamed chunk.
const MARKDOWN_COMPONENTS = {
  table: ({ children }: { children?: React.ReactNode }) => (
    <StyledTableScrollContainer>
      <table>{children}</table>
    </StyledTableScrollContainer>
  ),
  p: createChatReferenceElement(StyledParagraph),
  td: createChatReferenceElement('td'),
  th: createChatReferenceElement('th'),
  li: createChatReferenceElement('li'),
  h1: createChatReferenceElement('h1'),
  h2: createChatReferenceElement('h2'),
  h3: createChatReferenceElement('h3'),
  h4: createChatReferenceElement('h4'),
  h5: createChatReferenceElement('h5'),
  h6: createChatReferenceElement('h6'),
  a: ({
    children,
    href,
    title,
  }: {
    children?: React.ReactNode;
    href?: string;
    title?: string;
  }) => (
    <a
      className="markdown-link"
      href={getSafeUrl(href)}
      title={title}
      target="_blank"
      rel="noopener noreferrer"
    >
      {processChildrenForChatReferences(children)}
    </a>
  ),
  code: ({
    className,
    children,
  }: {
    className?: string;
    children?: React.ReactNode;
  }) => <code className={className}>{children}</code>,
  pre: ({ children }: { children?: React.ReactNode }) => (
    <MarkdownCodeBlock>{children}</MarkdownCodeBlock>
  ),
};

const MarkdownRenderer = lazy(async () => {
  const [{ default: Markdown }, { default: remarkGfm }] = await Promise.all([
    import('react-markdown'),
    import('remark-gfm'),
  ]);

  const remarkPlugins = [remarkGfm];

  return {
    default: ({ children }: { children: string }) => (
      <Markdown remarkPlugins={remarkPlugins} components={MARKDOWN_COMPONENTS}>
        {children}
      </Markdown>
    ),
  };
});

const LoadingSkeleton = () => {
  const { theme } = useContext(ThemeContext);
  return (
    <SkeletonTheme
      baseColor={theme.background.tertiary}
      highlightColor={theme.background.transparent.lighter}
      borderRadius={theme.border.radius.sm}
    >
      <StyledSkeletonContainer>
        <Skeleton
          width="70%"
          height={SKELETON_LOADER_HEIGHT_SIZES.standard.m}
        />

        <Skeleton height={SKELETON_LOADER_HEIGHT_SIZES.standard.s} />
        <Skeleton height={SKELETON_LOADER_HEIGHT_SIZES.standard.s} />
        <Skeleton
          width="90%"
          height={SKELETON_LOADER_HEIGHT_SIZES.standard.s}
        />

        <Skeleton
          width="85%"
          height={SKELETON_LOADER_HEIGHT_SIZES.standard.s}
        />
        <Skeleton
          width="80%"
          height={SKELETON_LOADER_HEIGHT_SIZES.standard.s}
        />
      </StyledSkeletonContainer>
    </SkeletonTheme>
  );
};

// Protecting per block behind the memo means only the streaming tail blocks
// pay the reference-parsing cost on each flush; settled blocks never re-run it.
const MemoizedMarkdownBlock = memo(
  ({ blockText }: { blockText: string }) => (
    <MarkdownRenderer>
      {protectChatReferencesForMarkdown(blockText)}
    </MarkdownRenderer>
  ),
  (previousProps, nextProps) => previousProps.blockText === nextProps.blockText,
);

export const LazyMarkdownRenderer = ({ text }: { text: string }) => {
  // Not state: the blocks are a pure function of `text`, the ref only caches
  // the previous split so streaming appends skip re-tokenizing settled blocks.
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
      <Suspense fallback={<LoadingSkeleton />}>
        {markdownBlocks.map((blockText, blockIndex) => (
          <MemoizedMarkdownBlock key={blockIndex} blockText={blockText} />
        ))}
      </Suspense>
    </StyledMarkdownContainer>
  );
};
