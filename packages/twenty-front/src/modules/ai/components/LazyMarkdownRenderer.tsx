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
        }}
      >
        {children}
      </Markdown>
    ),
  };
});

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

// Using div instead of p to allow RecordLink (which contains div elements) as children
const StyledParagraph = styled.div`
  margin-block: 1em;

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
    <Suspense fallback={<LoadingSkeleton />}>
      <MarkdownRenderer
        TableScrollContainer={StyledTableScrollContainer}
        StyledParagraph={StyledParagraph}
      >
        {text}
      </MarkdownRenderer>
    </Suspense>
  );
};
