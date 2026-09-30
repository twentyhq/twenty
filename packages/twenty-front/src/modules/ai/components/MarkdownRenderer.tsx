import {
  StyledParagraph,
  StyledTableScrollContainer,
} from '@/ai/components/LazyMarkdownRendererStyledComponents';
import { MarkdownCodeBlock } from '@/ai/components/MarkdownCodeBlock';
import { TextWithChatReferences } from '@/ai/components/TextWithChatReferences';
import { cloneElement, isValidElement } from 'react';
import { getSafeUrl, isDefined } from 'twenty-shared/utils';
import { lazyWithPreload } from '~/utils/lazyWithPreload';

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

const MARKDOWN_COMPONENTS_WITHOUT_IMAGES = {
  ...MARKDOWN_COMPONENTS,
  img: () => null,
};

type MarkdownRendererProps = {
  children: string;
  noImage?: boolean;
};

export const MarkdownRenderer = lazyWithPreload<MarkdownRendererProps>(
  async () => {
    const [{ default: Markdown }, { default: remarkGfm }] = await Promise.all([
      import('react-markdown'),
      import('remark-gfm'),
    ]);

    const remarkPlugins = [remarkGfm];

    return {
      default: ({ children, noImage }: MarkdownRendererProps) => (
        <Markdown
          remarkPlugins={remarkPlugins}
          components={
            noImage ? MARKDOWN_COMPONENTS_WITHOUT_IMAGES : MARKDOWN_COMPONENTS
          }
        >
          {children}
        </Markdown>
      ),
    };
  },
);
