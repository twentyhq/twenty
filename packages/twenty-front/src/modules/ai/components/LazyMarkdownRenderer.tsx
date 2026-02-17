import { SKELETON_LOADER_HEIGHT_SIZES } from '@/activities/components/SkeletonLoader';
import {
  parseRecordReference,
  RECORD_REFERENCE_REGEX,
  RecordLink,
} from '@/ai/components/RecordLink';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { lazy, Suspense } from 'react';
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';
import { isDefined } from 'twenty-shared/utils';

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
      StyledParagraph,
    }: {
      children: string;
      TableScrollContainer: React.ComponentType<{ children: React.ReactNode }>;
      StyledParagraph: React.ComponentType<{ children: React.ReactNode }>;
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
            <StyledParagraph>
              {processChildrenForRecordLinks(children)}
            </StyledParagraph>
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

const StyledMarkdownContainer = styled.div`
  border-radius: ${({ theme }) => theme.border.radius.sm};
  line-height: 150%;
  margin: ${({ theme }) => `${theme.spacing(1.5)} 0`};
  position: relative;
  scroll-margin-top: ${({ theme }) => theme.spacing(10)};
  scroll-margin-bottom: ${({ theme }) => theme.spacing(10)};

  &:empty {
    display: none;
  }

  .markdown-link {
    color: ${({ theme }) => theme.accent.accent11};
    text-decoration: none;
    -webkit-text-decoration: none;
  }

  .markdown-link:visited {
    color: ${({ theme }) => theme.accent.accent11};
  }

  .markdown-link:hover {
    text-decoration: underline !important;
  }

  strong,
  b {
    font-weight: ${({ theme }) => theme.font.weight.semiBold};
  }

  h1,
  h2,
  h3 {
    font-weight: ${({ theme }) => theme.font.weight.semiBold} !important;
  }

  h1 {
    font-size: 1.6em;
    line-height: 1.25;
    margin-bottom: 12px;
    margin-top: 24px;
  }

  h2 {
    font-size: 1.3em;
    line-height: 1.25;
    margin-bottom: 10px;
    margin-top: 20px;
  }

  h3 {
    font-size: 1.15em;
    line-height: 1.25;
    margin-bottom: 8px;
    margin-top: 18px;
  }

  h4 {
    font-size: 1.05em;
    line-height: 1.25;
    margin-bottom: 8px;
    margin-top: 16px;
  }

  h5 {
    font-size: 0.95em;
    line-height: 1.25;
    margin-bottom: 6px;
    margin-top: 14px;
  }

  h6 {
    font-size: 0.85em;
    line-height: 1.25;
    margin-bottom: 6px;
    margin-top: 12px;
  }

  hr {
    background-color: ${({ theme }) => theme.border.color.light} !important;
    border: none;
    height: 1px;
    margin: ${({ theme }) => theme.spacing(4)} 0;
  }

  ol:first-of-type:not(.nested),
  ul:first-of-type:not(.nested) {
    margin-top: ${({ theme }) => theme.spacing(1)} !important;
  }

  ol:last-of-type:not(.nested),
  ul:last-of-type:not(.nested) {
    margin-bottom: ${({ theme }) => theme.spacing(1)} !important;
  }

  li {
    line-height: 150%;
    margin-bottom: ${({ theme }) => theme.spacing(0.5)} !important;
    margin-top: ${({ theme }) => theme.spacing(0.5)} !important;
    padding-bottom: ${({ theme }) => theme.spacing(0.5)} !important;
    padding-top: ${({ theme }) => theme.spacing(0.5)} !important;
  }

  :not(pre) > code {
    background-color: ${({ theme }) => theme.background.tertiary};
    border-radius: ${({ theme }) => theme.border.radius.sm};
    color: ${({ theme }) => theme.font.color.primary};
    font-family: ${({ theme }) => `${theme.code.font.family}, monospace`};
    font-size: 0.9em;
    padding: 1.5px 3px;
    transition: all ${({ theme }) => theme.animation.duration.fast}s ease;
  }

  :not(pre) > code[style*='cursor: pointer'] {
    background-color: ${({ theme }) => theme.background.secondary};
    border: ${({ theme }) => `1px solid ${theme.accent.accent10}`};
    color: ${({ theme }) => theme.accent.accent10};
  }

  :not(pre) > code[style*='cursor: pointer']:hover {
    background-color: ${({ theme }) => theme.background.transparent.blue};
  }

  .markdown-code-outer-container {
    border-radius: ${({ theme }) => theme.border.radius.md} !important;
    overflow: hidden;
  }

  .markdown-block-code {
    background-color: ${({ theme }) => theme.background.secondary};
    border: 1px solid ${({ theme }) => theme.border.color.medium};
    border-radius: ${({ theme }) => theme.border.radius.md} !important;
  }

  .markdown-block-code * {
    animation: none !important;
  }

  img {
    height: auto;
    max-width: 100%;
  }
`;

// Using div instead of p to allow RecordLink (which contains div elements) as children
const StyledParagraph = styled.div`
  line-height: inherit;
  margin-block: ${({ theme }) => theme.spacing(2)};

  &:first-child {
    margin-block-start: 0;
  }

  &:last-child {
    margin-block-end: 0;
  }
`;

const StyledSkeletonContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(2)};
  width: 100%;
`;

const StyledTableScrollContainer = styled.div`
  overflow-x: auto;

  table {
    border-collapse: collapse;
    margin-block: ${({ theme }) => theme.spacing(2)};
  }

  th,
  td {
    border: ${({ theme }) => `1px solid ${theme.border.color.light}`};
    padding: ${({ theme }) => theme.spacing(2)};
  }

  th {
    background-color: ${({ theme }) => theme.background.secondary};
    font-weight: ${({ theme }) => theme.font.weight.medium};
  }
`;

const LoadingSkeleton = () => {
  const theme = useTheme();

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
          StyledParagraph={StyledParagraph}
        >
          {text}
        </MarkdownRenderer>
      </Suspense>
    </StyledMarkdownContainer>
  );
};
