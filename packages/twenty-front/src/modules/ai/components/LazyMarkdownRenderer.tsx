import { SKELETON_LOADER_HEIGHT_SIZES } from '@/activities/components/SkeletonLoader';
import { RecordLink } from '@/ai/components/RecordLink';
import {
  StyledMarkdownContainer,
  StyledParagraph,
  StyledSkeletonContainer,
  StyledTableScrollContainer,
} from '@/ai/components/LazyMarkdownRendererStyledComponents';
import { MarkdownCodeBlock } from '@/ai/components/MarkdownCodeBlock';
import {
  buildRecordReferenceToken,
  extractRecordReferences,
  RECORD_REFERENCE_PLACEHOLDER_REGEX,
  type RecordReference,
} from '@/ai/utils/extractRecordReferences';
import {
  cloneElement,
  createContext,
  isValidElement,
  lazy,
  Suspense,
  useContext,
} from 'react';
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';
import { getSafeUrl, isDefined } from 'twenty-shared/utils';
import { ThemeContext } from 'twenty-ui/theme-constants';

const RecordReferencesContext = createContext<RecordReference[]>([]);

const splitTextOnPlaceholders = (
  text: string,
  render: (referenceIndex: number, key: number) => React.ReactNode,
): React.ReactNode[] => {
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;

  RECORD_REFERENCE_PLACEHOLDER_REGEX.lastIndex = 0;

  let match;

  while ((match = RECORD_REFERENCE_PLACEHOLDER_REGEX.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }

    parts.push(render(Number(match[1]), match.index));

    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return parts;
};

// Prose: turn each placeholder into a clickable record chip.
const TextWithRecordLinks = ({ text }: { text: string }) => {
  const references = useContext(RecordReferencesContext);

  const parts = splitTextOnPlaceholders(text, (referenceIndex, key) => {
    const reference = references[referenceIndex];

    if (!isDefined(reference)) {
      return null;
    }

    return (
      <RecordLink
        key={key}
        objectNameSingular={reference.objectNameSingular}
        recordId={reference.recordId}
        displayName={reference.displayName}
      />
    );
  });

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

// Code/pre: references never render as chips inside code, so restore the
// original [[record:...]] text instead of leaking the placeholder sentinels.
const CodeChildrenWithRestoredReferences = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const references = useContext(RecordReferencesContext);

  if (typeof children === 'string') {
    return (
      <>
        {splitTextOnPlaceholders(children, (referenceIndex) => {
          const reference = references[referenceIndex];

          return isDefined(reference)
            ? buildRecordReferenceToken(reference)
            : '';
        })}
      </>
    );
  }

  return <>{children}</>;
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
          em: ({ children }) => (
            <em>{processChildrenForRecordLinks(children)}</em>
          ),
          strong: ({ children }) => (
            <strong>{processChildrenForRecordLinks(children)}</strong>
          ),
          del: ({ children }) => (
            <del>{processChildrenForRecordLinks(children)}</del>
          ),
          blockquote: ({ children }) => (
            <blockquote>{processChildrenForRecordLinks(children)}</blockquote>
          ),
          code: ({
            className,
            children,
          }: {
            className?: string;
            children?: React.ReactNode;
          }) => (
            <code className={className}>
              <CodeChildrenWithRestoredReferences>
                {children}
              </CodeChildrenWithRestoredReferences>
            </code>
          ),
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

export const LazyMarkdownRenderer = ({ text }: { text: string }) => {
  const { sanitizedText, references } = extractRecordReferences(text);

  return (
    <StyledMarkdownContainer
      className="markdown-section"
      data-replay-ignore-mutations="true"
    >
      <RecordReferencesContext.Provider value={references}>
        <Suspense fallback={<LoadingSkeleton />}>
          <MarkdownRenderer
            TableScrollContainer={StyledTableScrollContainer}
            ParagraphComponent={StyledParagraph}
          >
            {sanitizedText}
          </MarkdownRenderer>
        </Suspense>
      </RecordReferencesContext.Provider>
    </StyledMarkdownContainer>
  );
};
