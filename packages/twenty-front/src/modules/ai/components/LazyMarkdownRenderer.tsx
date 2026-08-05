import { SKELETON_LOADER_HEIGHT_SIZES } from '@/activities/components/SkeletonLoader';
import { ChatReferencePlaceholderText } from '@/ai/components/ChatReferencePlaceholderText';
import {
  StyledMarkdownContainer,
  StyledParagraph,
  StyledSkeletonContainer,
  StyledTableScrollContainer,
} from '@/ai/components/LazyMarkdownRendererStyledComponents';
import { MarkdownCodeBlock } from '@/ai/components/MarkdownCodeBlock';
import { ChatReferencesContext } from '@/ai/contexts/ChatReferencesContext';
import { type ChatReferenceMatch } from '@/ai/types/ChatReferenceMatch';
import { replaceChatReferencePlaceholdersWithDisplayNames } from '@/ai/utils/replaceChatReferencePlaceholdersWithDisplayNames';
import { replaceChatReferencesWithPlaceholders } from '@/ai/utils/replaceChatReferencesWithPlaceholders';
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

const processChildrenForChatReferences = (
  children: React.ReactNode,
): React.ReactNode => {
  if (typeof children === 'string') {
    return <ChatReferencePlaceholderText text={children} />;
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

const restoreChatReferenceDisplayNames = ({
  children,
  references,
}: {
  children: React.ReactNode;
  references: ChatReferenceMatch[];
}): React.ReactNode => {
  if (typeof children === 'string') {
    return replaceChatReferencePlaceholdersWithDisplayNames({
      text: children,
      references,
    });
  }

  if (Array.isArray(children)) {
    return children.map((child) =>
      restoreChatReferenceDisplayNames({ children: child, references }),
    );
  }

  return children;
};

const MarkdownCode = ({
  className,
  children,
}: {
  className?: string;
  children?: React.ReactNode;
}) => {
  const references = useContext(ChatReferencesContext);

  return (
    <code className={className}>
      {restoreChatReferenceDisplayNames({ children, references })}
    </code>
  );
};

// react-markdown uses each entry as the JSX element type, so rebuilding this map
// per render would remount every node on every streamed chunk.
const MARKDOWN_COMPONENTS = {
  table: ({ children }: { children?: React.ReactNode }) => (
    <StyledTableScrollContainer>
      <table>{children}</table>
    </StyledTableScrollContainer>
  ),
  p: ({ children }: { children?: React.ReactNode }) => (
    <StyledParagraph>
      {processChildrenForChatReferences(children)}
    </StyledParagraph>
  ),
  td: ({ children }: { children?: React.ReactNode }) => (
    <td>{processChildrenForChatReferences(children)}</td>
  ),
  th: ({ children }: { children?: React.ReactNode }) => (
    <th>{processChildrenForChatReferences(children)}</th>
  ),
  li: ({ children }: { children?: React.ReactNode }) => (
    <li>{processChildrenForChatReferences(children)}</li>
  ),
  h1: ({ children }: { children?: React.ReactNode }) => (
    <h1>{processChildrenForChatReferences(children)}</h1>
  ),
  h2: ({ children }: { children?: React.ReactNode }) => (
    <h2>{processChildrenForChatReferences(children)}</h2>
  ),
  h3: ({ children }: { children?: React.ReactNode }) => (
    <h3>{processChildrenForChatReferences(children)}</h3>
  ),
  h4: ({ children }: { children?: React.ReactNode }) => (
    <h4>{processChildrenForChatReferences(children)}</h4>
  ),
  h5: ({ children }: { children?: React.ReactNode }) => (
    <h5>{processChildrenForChatReferences(children)}</h5>
  ),
  h6: ({ children }: { children?: React.ReactNode }) => (
    <h6>{processChildrenForChatReferences(children)}</h6>
  ),
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
  code: MarkdownCode,
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

// Equal block text implies equal placeholder indices, so references is left out
// of the comparison to keep an unchanged block from re-rendering on every chunk.
const MemoizedMarkdownBlock = memo(
  ({
    blockText,
    references,
  }: {
    blockText: string;
    references: ChatReferenceMatch[];
  }) => (
    <ChatReferencesContext.Provider value={references}>
      <MarkdownRenderer>{blockText}</MarkdownRenderer>
    </ChatReferencesContext.Provider>
  ),
  (previousProps, nextProps) => previousProps.blockText === nextProps.blockText,
);

export const LazyMarkdownRenderer = ({ text }: { text: string }) => {
  const { textWithPlaceholders, references } = useMemo(
    () => replaceChatReferencesWithPlaceholders(text),
    [text],
  );

  const markdownBlocks = useMemo(
    () => marked.lexer(textWithPlaceholders).map((token) => token.raw),
    [textWithPlaceholders],
  );

  return (
    <StyledMarkdownContainer
      className="markdown-section"
      data-replay-ignore-mutations="true"
    >
      <Suspense fallback={<LoadingSkeleton />}>
        {markdownBlocks.map((blockText, blockIndex) => (
          <MemoizedMarkdownBlock
            key={blockIndex}
            blockText={blockText}
            references={references}
          />
        ))}
      </Suspense>
    </StyledMarkdownContainer>
  );
};
