import { SKELETON_LOADER_HEIGHT_SIZES } from '@/activities/components/SkeletonLoader';
import {
  StyledMarkdownContainer,
  StyledParagraph,
  StyledSkeletonContainer,
  StyledTableScrollContainer,
} from '@/ai/components/LazyMarkdownRendererStyledComponents';
import { MarkdownCodeBlock } from '@/ai/components/MarkdownCodeBlock';
import { TextWithRecordLinks } from '@/ai/components/TextWithRecordLinks';
import { protectRecordReferencesForMarkdown } from '@/ai/utils/protectRecordReferencesForMarkdown';
import { marked } from 'marked';
import {
  cloneElement,
  isValidElement,
  lazy,
  memo,
  Suspense,
  useContext,
  useMemo,
} from 'react';
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';
import { getSafeUrl, isDefined } from 'twenty-shared/utils';
import { ThemeContext } from 'twenty-ui/theme-constants';

const processChildrenForRecordLinks = (
  children: React.ReactNode,
): React.ReactNode => {
  if (typeof children === 'string') {
    return <TextWithRecordLinks text={children} />;
  }

  if (Array.isArray(children)) {
    return children.map((child, index) => (
      <span key={index}>{processChildrenForRecordLinks(child)}</span>
    ));
  }

  if (isValidElement<{ children?: React.ReactNode }>(children)) {
    const childProps = children.props;

    if (isDefined(childProps.children)) {
      return cloneElement(children, {
        children: processChildrenForRecordLinks(childProps.children),
      });
    }
  }

  return children;
};

const MarkdownRenderer = lazy(async () => {
  const [{ default: Markdown }, { default: remarkGfm }] = await Promise.all([
    import('react-markdown'),
    import('remark-gfm'),
  ]);

  return {
    default: ({
      children,
      TableScrollContainer,
      ParagraphComponent,
    }: {
      children: string;
      TableScrollContainer: React.ComponentType<{ children: React.ReactNode }>;
      ParagraphComponent: React.ComponentType<{ children: React.ReactNode }>;
    }) => (
      <Markdown
        remarkPlugins={[remarkGfm]}
        components={{
          table: ({ children }) => (
            <TableScrollContainer>
              <table>{children}</table>
            </TableScrollContainer>
          ),
          p: ({ children }) => (
            <ParagraphComponent>
              {processChildrenForRecordLinks(children)}
            </ParagraphComponent>
          ),
          td: ({ children }) => (
            <td>{processChildrenForRecordLinks(children)}</td>
          ),
          th: ({ children }) => (
            <th>{processChildrenForRecordLinks(children)}</th>
          ),
          li: ({ children }) => (
            <li>{processChildrenForRecordLinks(children)}</li>
          ),
          h1: ({ children }) => (
            <h1>{processChildrenForRecordLinks(children)}</h1>
          ),
          h2: ({ children }) => (
            <h2>{processChildrenForRecordLinks(children)}</h2>
          ),
          h3: ({ children }) => (
            <h3>{processChildrenForRecordLinks(children)}</h3>
          ),
          h4: ({ children }) => (
            <h4>{processChildrenForRecordLinks(children)}</h4>
          ),
          h5: ({ children }) => (
            <h5>{processChildrenForRecordLinks(children)}</h5>
          ),
          h6: ({ children }) => (
            <h6>{processChildrenForRecordLinks(children)}</h6>
          ),
          a: ({ children, href, title, node: _node }) => (
            <a
              className="markdown-link"
              href={getSafeUrl(href)}
              title={title}
              target="_blank"
              rel="noopener noreferrer"
            >
              {processChildrenForRecordLinks(children)}
            </a>
          ),
          code: ({
            className,
            children,
          }: {
            className?: string;
            children?: React.ReactNode;
          }) => <code className={className}>{children}</code>,
          pre: ({ children }) => (
            <MarkdownCodeBlock>{children}</MarkdownCodeBlock>
          ),
        }}
      >
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

const MemoizedMarkdownBlock = memo(
  ({ blockText }: { blockText: string }) => (
    <MarkdownRenderer
      TableScrollContainer={StyledTableScrollContainer}
      ParagraphComponent={StyledParagraph}
    >
      {blockText}
    </MarkdownRenderer>
  ),
  (previousProps, nextProps) => previousProps.blockText === nextProps.blockText,
);

export const LazyMarkdownRenderer = ({ text }: { text: string }) => {
  const protectedText = useMemo(
    () => protectRecordReferencesForMarkdown(text),
    [text],
  );

  const markdownBlocks = useMemo(
    () => marked.lexer(protectedText).map((token) => token.raw),
    [protectedText],
  );

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
