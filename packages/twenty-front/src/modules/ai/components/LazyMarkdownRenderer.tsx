import { SKELETON_LOADER_HEIGHT_SIZES } from '@/activities/components/SkeletonLoader';
import {
  parseRecordReference,
  RECORD_REFERENCE_REGEX,
  RecordLink,
} from '@/ai/components/RecordLink';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { Fragment, lazy, Suspense, useMemo } from 'react';
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';
import { isDefined } from 'twenty-shared/utils';

const MarkdownRenderer = lazy(async () => {
  const [{ default: Markdown }, { default: remarkGfm }] = await Promise.all([
    import('react-markdown'),
    import('remark-gfm'),
  ]);

  return {
    default: ({
      children,
      TableScrollContainer,
    }: {
      children: string;
      TableScrollContainer: React.ComponentType<{ children: React.ReactNode }>;
    }) => (
      <Markdown
        remarkPlugins={[remarkGfm]}
        components={{
          table: ({ children }) => (
            <TableScrollContainer>
              <table>{children}</table>
            </TableScrollContainer>
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

const useTextWithRecordLinks = (text: string) => {
  return useMemo(() => {
    const parts: Array<
      | string
      | { type: 'record'; props: ReturnType<typeof parseRecordReference> }
    > = [];
    let lastIndex = 0;

    RECORD_REFERENCE_REGEX.lastIndex = 0;

    let match;

    while ((match = RECORD_REFERENCE_REGEX.exec(text)) !== null) {
      if (match.index > lastIndex) {
        parts.push(text.slice(lastIndex, match.index));
      }

      const parsed = parseRecordReference(match[0]);

      if (isDefined(parsed)) {
        parts.push({ type: 'record', props: parsed });
      }

      lastIndex = match.index + match[0].length;
    }

    if (lastIndex < text.length) {
      parts.push(text.slice(lastIndex));
    }

    return parts;
  }, [text]);
};

export const LazyMarkdownRenderer = ({ text }: { text: string }) => {
  const parts = useTextWithRecordLinks(text);

  // If there are no record references, render normally
  const hasRecordReferences = parts.some(
    (part) => typeof part === 'object' && part.type === 'record',
  );

  if (!hasRecordReferences) {
    return (
      <Suspense fallback={<LoadingSkeleton />}>
        <MarkdownRenderer TableScrollContainer={StyledTableScrollContainer}>
          {text}
        </MarkdownRenderer>
      </Suspense>
    );
  }

  // Render with record links inline
  return (
    <Suspense fallback={<LoadingSkeleton />}>
      {parts.map((part, index) => {
        if (typeof part === 'string') {
          return (
            <MarkdownRenderer
              key={index}
              TableScrollContainer={StyledTableScrollContainer}
            >
              {part}
            </MarkdownRenderer>
          );
        }

        if (part.type === 'record' && isDefined(part.props)) {
          return (
            <Fragment key={index}>
              <RecordLink
                objectNameSingular={part.props.objectNameSingular}
                recordId={part.props.recordId}
                displayName={part.props.displayName}
              />
            </Fragment>
          );
        }

        return null;
      })}
    </Suspense>
  );
};
