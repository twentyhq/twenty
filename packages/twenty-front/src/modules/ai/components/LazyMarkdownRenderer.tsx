import { SKELETON_LOADER_HEIGHT_SIZES } from '@/activities/components/SkeletonLoader';
import {
  StyledMarkdownContainer,
  StyledParagraph,
  StyledSkeletonContainer,
  StyledTableScrollContainer,
} from '@/ai/components/LazyMarkdownRendererStyledComponents';
import { MarkdownCodeBlock } from '@/ai/components/MarkdownCodeBlock';
import { TextWithChatReferences } from '@/ai/components/TextWithChatReferences';
import { EMPTY_MARKDOWN_BLOCK_SPLIT_CACHE } from '@/ai/constants/EmptyMarkdownBlockSplitCache';
import { getMarkdownBlocksIncrementally } from '@/ai/utils/getMarkdownBlocksIncrementally';
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
import { type Options as MarkdownOptions } from 'react-markdown';
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

// Raw HTML is only ever enabled for content we do not author (marketplace app
// descriptions), so it is parsed and sanitized in one pass before rendering.
const SanitizedHtmlMarkdownRenderer = lazy(async () => {
  const [
    { default: Markdown },
    { default: remarkGfm },
    { default: rehypeRaw },
    { default: rehypeSanitize, defaultSchema },
  ] = await Promise.all([
    import('react-markdown'),
    import('remark-gfm'),
    import('rehype-raw'),
    import('rehype-sanitize'),
  ]);

  const remarkPlugins = [remarkGfm];
  const rehypePlugins: NonNullable<MarkdownOptions['rehypePlugins']> = [
    rehypeRaw,
    [rehypeSanitize, defaultSchema],
  ];

  return {
    default: ({ children }: { children: string }) => (
      <Markdown
        remarkPlugins={remarkPlugins}
        rehypePlugins={rehypePlugins}
        components={MARKDOWN_COMPONENTS}
      >
        {children}
      </Markdown>
    ),
  };
});

export const MarkdownLoadingSkeleton = () => {
  const { theme } = useContext(ThemeContext);
  return (
    <SkeletonTheme
      baseColor={theme.background.tertiary}
      highlightColor={theme.background.transparent.lighter}
      borderRadius={theme.border.radius.sm}
    >
      <StyledSkeletonContainer>
        <Skeleton
          width={200}
          height={SKELETON_LOADER_HEIGHT_SIZES.standard.s}
        />
      </StyledSkeletonContainer>
    </SkeletonTheme>
  );
};

// Protecting per block behind the memo means only the streaming tail blocks
// pay the reference-parsing cost on each flush; settled blocks never re-run it.
const MemoizedMarkdownBlock = memo(({ blockText }: { blockText: string }) => (
  <MarkdownRenderer>
    {protectChatReferencesForMarkdown(blockText)}
  </MarkdownRenderer>
));

type LazyMarkdownRendererProps = {
  text: string;
  allowSanitizedHtml?: boolean;
};

type LazyMarkdownContentProps = LazyMarkdownRendererProps;

export const LazyMarkdownContent = ({
  text,
  allowSanitizedHtml = false,
}: LazyMarkdownContentProps) => {
  // Not state: the blocks are a pure function of `text`, the ref only caches
  // the previous split so streaming appends skip re-tokenizing settled blocks.
  // oxlint-disable-next-line twenty/no-state-useref
  const blockSplitCacheRef = useRef(EMPTY_MARKDOWN_BLOCK_SPLIT_CACHE);

  // An HTML element can wrap several markdown paragraphs, so the sanitized
  // renderer gets the whole text instead of the per-block streaming split.
  if (allowSanitizedHtml) {
    return (
      <StyledMarkdownContainer
        className="markdown-section"
        data-replay-ignore-mutations="true"
      >
        <SanitizedHtmlMarkdownRenderer>
          {protectChatReferencesForMarkdown(text)}
        </SanitizedHtmlMarkdownRenderer>
      </StyledMarkdownContainer>
    );
  }

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
        <MemoizedMarkdownBlock key={blockIndex} blockText={blockText} />
      ))}
    </StyledMarkdownContainer>
  );
};

export const LazyMarkdownRenderer = ({
  text,
  allowSanitizedHtml,
}: LazyMarkdownRendererProps) => (
  <Suspense fallback={<MarkdownLoadingSkeleton />}>
    <LazyMarkdownContent text={text} allowSanitizedHtml={allowSanitizedHtml} />
  </Suspense>
);
