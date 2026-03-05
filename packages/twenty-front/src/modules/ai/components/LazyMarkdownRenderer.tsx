import { SKELETON_LOADER_HEIGHT_SIZES } from '@/activities/components/SkeletonLoader';
import {
  parseRecordReference,
  RECORD_REFERENCE_REGEX,
  RecordLink,
} from '@/ai/components/RecordLink';
import {
  StyledMarkdownContainer,
  StyledParagraph,
  StyledSkeletonContainer,
  StyledTableScrollContainer,
} from '@/ai/components/LazyMarkdownRendererStyledComponents';
import { lazy, Suspense, useContext } from 'react';
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';
import { isDefined } from 'twenty-shared/utils';
import { ThemeContext } from 'twenty-ui/theme-constants';

const TextWithRecordLinks = ({ text }: { text: string }) => {
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;

  RECORD_REFERENCE_REGEX.lastIndex = 0;

  let match;

  while ((match = RECORD_REFERENCE_REGEX.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }

    const parsed = parseRecordReference(match[0]);

    if (isDefined(parsed)) {
      parts.push(
        <RecordLink
          key={match.index}
          objectNameSingular={parsed.objectNameSingular}
          recordId={parsed.recordId}
          displayName={parsed.displayName}
        />,
      );
    }

    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return <>{parts}</>;
};

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
          li: ({ children }) => (
            <li>{processChildrenForRecordLinks(children)}</li>
          ),
          a: ({ children, href, title, target, rel, node: _node }) => (
            <a
              className="markdown-link"
              href={href}
              title={title}
              target={target}
              rel={rel}
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
            <div className="markdown-code-outer-container">
              <pre className="markdown-block-code">{children}</pre>
            </div>
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

export const LazyMarkdownRenderer = ({ text }: { text: string }) => {
  return (
    <StyledMarkdownContainer className="markdown-section">
      <Suspense fallback={<LoadingSkeleton />}>
        <MarkdownRenderer
          TableScrollContainer={StyledTableScrollContainer}
          ParagraphComponent={StyledParagraph}
        >
          {text}
        </MarkdownRenderer>
      </Suspense>
    </StyledMarkdownContainer>
  );
};
