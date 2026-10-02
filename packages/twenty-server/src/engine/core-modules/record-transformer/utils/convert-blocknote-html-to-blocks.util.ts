import { randomUUID } from 'crypto';

import { DomUtils, parseDocument } from 'htmlparser2';
import { isDefined } from 'twenty-shared/utils';

type HtmlNode = ReturnType<typeof parseDocument>['children'][number];
type HtmlElement = Extract<HtmlNode, { attribs: Record<string, string> }>;

type BlockNoteStyle = 'bold' | 'italic' | 'strike' | 'code';

type BlockNoteStyles = Partial<Record<BlockNoteStyle, true>>;

type BlockNoteStyledText = {
  type: 'text';
  text: string;
  styles: BlockNoteStyles;
};

type BlockNoteLink = {
  type: 'link';
  href: string;
  content: BlockNoteStyledText[];
};

type BlockNoteInlineContent = BlockNoteStyledText | BlockNoteLink;

export type BlockNoteBlock = {
  id: string;
  type: string;
  props: Record<string, string | number | boolean>;
  content?: BlockNoteInlineContent[];
  children: BlockNoteBlock[];
};

export type BlockNoteHtmlConversionResult =
  | { status: 'converted'; blocks: BlockNoteBlock[] }
  | { status: 'unsupported' }
  | { status: 'raw-html' };

// Every element and attribute BlockNote's markdownToHTML can emit from
// markdown syntax. Anything else came from raw HTML in the markdown.
const MARKDOWN_ELEMENT_ATTRIBUTES: Record<string, string[]> = {
  p: [],
  h1: [],
  h2: [],
  h3: [],
  h4: [],
  h5: [],
  h6: [],
  strong: [],
  em: [],
  del: [],
  code: ['data-language'],
  pre: [],
  a: ['href', 'title'],
  br: [],
  hr: [],
  blockquote: [],
  ul: [],
  ol: ['start'],
  li: [],
  input: ['type', 'disabled', 'checked'],
  table: [],
  thead: [],
  tbody: [],
  tr: [],
  th: ['align'],
  td: ['align'],
  img: ['src', 'alt', 'title'],
  video: ['src', 'data-name', 'data-url', 'controls'],
};

const STYLE_BY_ELEMENT_NAME: Record<string, BlockNoteStyle> = {
  strong: 'bold',
  em: 'italic',
  del: 'strike',
  code: 'code',
};

const STYLE_ORDER: BlockNoteStyle[] = ['bold', 'italic', 'strike', 'code'];

const LIST_ITEM_BLOCK_TYPES = new Set([
  'bulletListItem',
  'numberedListItem',
  'checkListItem',
]);

const DEFAULT_BLOCK_PROPS = {
  backgroundColor: 'default',
  textColor: 'default',
  textAlignment: 'left',
};

class UnsupportedBlockNoteHtmlError extends Error {}

const isMarkdownElement = (element: HtmlElement): boolean => {
  const allowedAttributes = MARKDOWN_ELEMENT_ATTRIBUTES[element.name];

  return (
    allowedAttributes !== undefined &&
    Object.keys(element.attribs).every((attribute) =>
      allowedAttributes.includes(attribute),
    )
  );
};

const containsRawHtml = (nodes: HtmlNode[]): boolean =>
  nodes.some((node) => {
    if (DomUtils.isText(node)) {
      return false;
    }

    if (!DomUtils.isTag(node)) {
      return true;
    }

    return !isMarkdownElement(node) || containsRawHtml(node.children);
  });

const hasNoAttributes = (element: HtmlElement): boolean =>
  Object.keys(element.attribs).length === 0;

// Mirrors ProseMirror's mark rules in the BlockNote schema: code excludes
// every other mark, including links.
const buildStyles = (styles: BlockNoteStyle[]): BlockNoteStyles => {
  if (styles.includes('code')) {
    return { code: true };
  }

  return Object.fromEntries(
    STYLE_ORDER.filter((style) => styles.includes(style)).map((style) => [
      style,
      true,
    ]),
  );
};

const areSameStyles = (
  firstStyles: BlockNoteStyles,
  secondStyles: BlockNoteStyles,
): boolean => JSON.stringify(firstStyles) === JSON.stringify(secondStyles);

type InlineRun = { text: string; styles: BlockNoteStyles; href?: string };

const collectInlineRuns = (
  nodes: HtmlNode[],
  styles: BlockNoteStyle[],
  href: string | undefined,
  runs: InlineRun[],
): void => {
  for (const node of nodes) {
    if (DomUtils.isText(node)) {
      // BlockNote collapses whitespace only in text nodes holding a newline
      const text = /[\r\n]/.test(node.data)
        ? node.data.replace(/[ \t\r\n\f]+/g, ' ')
        : node.data;

      if (text.length === 0) {
        continue;
      }

      const runStyles = buildStyles(styles);
      const runHref = styles.includes('code') ? undefined : href;
      const lastRun = runs[runs.length - 1];

      if (
        lastRun !== undefined &&
        lastRun.href === runHref &&
        areSameStyles(lastRun.styles, runStyles)
      ) {
        lastRun.text += text;
      } else {
        runs.push({ text, styles: runStyles, href: runHref });
      }

      continue;
    }

    if (!DomUtils.isTag(node)) {
      throw new UnsupportedBlockNoteHtmlError();
    }

    const style = STYLE_BY_ELEMENT_NAME[node.name];

    if (node.name === 'br') {
      // A hard break joins the previous run, whatever its styles
      const lastRun = runs[runs.length - 1];

      if (lastRun !== undefined) {
        lastRun.text += '\n';
      } else {
        runs.push({ text: '\n', styles: {} });
      }
    } else if (style !== undefined && hasNoAttributes(node)) {
      collectInlineRuns(node.children, [...styles, style], href, runs);
    } else if (node.name === 'a' && (node.attribs.href ?? '').length > 0) {
      if (href !== undefined) {
        throw new UnsupportedBlockNoteHtmlError();
      }

      collectInlineRuns(node.children, styles, node.attribs.href, runs);
    } else {
      throw new UnsupportedBlockNoteHtmlError();
    }
  }
};

const convertInlineNodes = (nodes: HtmlNode[]): BlockNoteInlineContent[] => {
  const runs: InlineRun[] = [];

  collectInlineRuns(nodes, [], undefined, runs);

  if (runs.length > 0 && runs.every((run) => run.text.trim().length === 0)) {
    throw new UnsupportedBlockNoteHtmlError();
  }

  const content: BlockNoteInlineContent[] = [];

  for (const run of runs) {
    const styledText: BlockNoteStyledText = {
      type: 'text',
      text: run.text,
      styles: run.styles,
    };

    if (run.href === undefined) {
      content.push(styledText);
      continue;
    }

    const lastContent = content[content.length - 1];

    if (lastContent?.type === 'link' && lastContent.href === run.href) {
      lastContent.content.push(styledText);
    } else {
      content.push({ type: 'link', href: run.href, content: [styledText] });
    }
  }

  const hasBlankLink = content.some(
    (inlineContent) =>
      inlineContent.type === 'link' &&
      inlineContent.content.every(
        (styledText) => styledText.text.trim().length === 0,
      ),
  );

  if (hasBlankLink) {
    throw new UnsupportedBlockNoteHtmlError();
  }

  return content;
};

const createBlock = ({
  type,
  props,
  content,
  children = [],
}: {
  type: string;
  props: BlockNoteBlock['props'];
  content?: BlockNoteInlineContent[];
  children?: BlockNoteBlock[];
}): BlockNoteBlock => ({
  id: randomUUID(),
  type,
  props,
  ...(content === undefined ? {} : { content }),
  children,
});

const convertListItem = ({
  listItem,
  isOrderedList,
  isFirstItem,
  start,
}: {
  listItem: HtmlElement;
  isOrderedList: boolean;
  isFirstItem: boolean;
  start: number | undefined;
}): BlockNoteBlock => {
  let [paragraph, ...childNodes] = listItem.children;
  let checked: boolean | undefined;

  if (DomUtils.isTag(paragraph) && paragraph.name === 'input') {
    if (paragraph.attribs.type !== 'checkbox') {
      throw new UnsupportedBlockNoteHtmlError();
    }

    checked = paragraph.attribs.checked !== undefined;
    [paragraph, ...childNodes] = childNodes;
  }

  if (!DomUtils.isTag(paragraph) || paragraph.name !== 'p') {
    throw new UnsupportedBlockNoteHtmlError();
  }

  const content = convertInlineNodes(paragraph.children);
  const children = convertBlockNodes(childNodes);
  const hasNestedList = children.some((child) =>
    LIST_ITEM_BLOCK_TYPES.has(child.type),
  );

  // BlockNote restructures these shapes through DOM moves we do not mirror
  if (hasNestedList) {
    const nestedListKinds = new Set(
      children.map((child) =>
        LIST_ITEM_BLOCK_TYPES.has(child.type)
          ? child.type === 'numberedListItem'
            ? 'ordered'
            : 'unordered'
          : 'other',
      ),
    );

    if (nestedListKinds.size > 1) {
      throw new UnsupportedBlockNoteHtmlError();
    }
  }

  if (content.length === 0 && children.length > 0) {
    throw new UnsupportedBlockNoteHtmlError();
  }

  if (checked !== undefined) {
    return createBlock({
      type: 'checkListItem',
      props: { ...DEFAULT_BLOCK_PROPS, checked },
      content,
      children,
    });
  }

  if (isOrderedList) {
    // BlockNote wraps an item followed by a nested list, which drops its start
    const props =
      isFirstItem && isDefined(start) && start !== 1 && !hasNestedList
        ? { ...DEFAULT_BLOCK_PROPS, start }
        : { ...DEFAULT_BLOCK_PROPS };

    return createBlock({
      type: 'numberedListItem',
      props,
      content,
      children,
    });
  }

  return createBlock({
    type: 'bulletListItem',
    props: { ...DEFAULT_BLOCK_PROPS },
    content,
    children,
  });
};

const convertCodeBlock = (preElement: HtmlElement): BlockNoteBlock => {
  const [codeElement] = preElement.children;

  if (
    preElement.children.length !== 1 ||
    !DomUtils.isTag(codeElement) ||
    codeElement.name !== 'code' ||
    !codeElement.children.every(DomUtils.isText)
  ) {
    throw new UnsupportedBlockNoteHtmlError();
  }

  const language = codeElement.attribs['data-language'];

  if (language === undefined || language.length === 0) {
    throw new UnsupportedBlockNoteHtmlError();
  }

  const code = DomUtils.textContent(codeElement);

  return createBlock({
    type: 'codeBlock',
    props: { language },
    content: code.length > 0 ? [{ type: 'text', text: code, styles: {} }] : [],
  });
};

const convertBlockNodes = (nodes: HtmlNode[]): BlockNoteBlock[] => {
  const blocks: BlockNoteBlock[] = [];

  for (const node of nodes) {
    if (!DomUtils.isTag(node)) {
      throw new UnsupportedBlockNoteHtmlError();
    }

    const headingLevel = /^h([1-6])$/.exec(node.name)?.[1];

    if (headingLevel !== undefined && hasNoAttributes(node)) {
      blocks.push(
        createBlock({
          type: 'heading',
          props: {
            ...DEFAULT_BLOCK_PROPS,
            level: Number(headingLevel),
            isToggleable: false,
          },
          content: convertInlineNodes(node.children),
        }),
      );
    } else if (node.name === 'p' && hasNoAttributes(node)) {
      blocks.push(
        createBlock({
          type: 'paragraph',
          props: { ...DEFAULT_BLOCK_PROPS },
          content: convertInlineNodes(node.children),
        }),
      );
    } else if (node.name === 'hr' && hasNoAttributes(node)) {
      blocks.push(createBlock({ type: 'divider', props: {} }));
    } else if (node.name === 'pre' && hasNoAttributes(node)) {
      blocks.push(convertCodeBlock(node));
    } else if (
      node.name === 'blockquote' &&
      node.children.length === 1 &&
      DomUtils.isTag(node.children[0]) &&
      node.children[0].name === 'p'
    ) {
      blocks.push(
        createBlock({
          type: 'quote',
          props: { backgroundColor: 'default', textColor: 'default' },
          content: convertInlineNodes(node.children[0].children),
        }),
      );
    } else if (node.name === 'ul' || node.name === 'ol') {
      const start =
        node.attribs.start === undefined
          ? undefined
          : Number(node.attribs.start);

      node.children.forEach((listItem, index) => {
        if (!DomUtils.isTag(listItem) || listItem.name !== 'li') {
          throw new UnsupportedBlockNoteHtmlError();
        }

        blocks.push(
          convertListItem({
            listItem,
            isOrderedList: node.name === 'ol',
            isFirstItem: index === 0,
            start,
          }),
        );
      });
    } else {
      throw new UnsupportedBlockNoteHtmlError();
    }
  }

  return blocks;
};

// Builds BlockNote blocks from the HTML BlockNote's own markdownToHTML emits,
// matching what its DOM + ProseMirror parser would produce without a DOM.
// Shapes it cannot reproduce exactly are reported as unsupported.
export const convertBlockNoteHtmlToBlocks = (
  html: string,
): BlockNoteHtmlConversionResult => {
  const document = parseDocument(html);

  if (containsRawHtml(document.children)) {
    return { status: 'raw-html' };
  }

  try {
    const blocks = convertBlockNodes(document.children);

    return {
      status: 'converted',
      blocks:
        blocks.length > 0
          ? blocks
          : [
              createBlock({
                type: 'paragraph',
                props: { ...DEFAULT_BLOCK_PROPS },
                content: [],
              }),
            ],
    };
  } catch (error) {
    if (error instanceof UnsupportedBlockNoteHtmlError) {
      return { status: 'unsupported' };
    }

    throw error;
  }
};
