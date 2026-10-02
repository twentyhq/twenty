import { randomUUID } from 'crypto';

import { Lexer, type Token, type Tokens } from 'marked';

type BlockNoteStyle = 'bold' | 'italic' | 'strike' | 'code';

type BlockNoteStyledText = {
  type: 'text';
  text: string;
  styles: Partial<Record<BlockNoteStyle, true>>;
};

type BlockNoteLink = {
  type: 'link';
  href: string;
  content: BlockNoteStyledText[];
};

type BlockNoteInlineContent = BlockNoteStyledText | BlockNoteLink;

type BlockNoteTableContent = {
  type: 'tableContent';
  columnWidths: null[];
  headerRows: number;
  rows: {
    cells: {
      type: 'tableCell';
      content: BlockNoteInlineContent[];
      props: Record<string, string | number>;
    }[];
  }[];
};

type BlockNoteBlock = {
  id: string;
  type: string;
  props: Record<string, string | number | boolean>;
  content?: BlockNoteInlineContent[] | BlockNoteTableContent;
  children: BlockNoteBlock[];
};

type InlineRun = {
  text: string;
  styles: BlockNoteStyle[];
  href?: string;
};

const STYLE_BY_TOKEN_TYPE: Record<string, BlockNoteStyle> = {
  strong: 'bold',
  em: 'italic',
  del: 'strike',
};

const DEFAULT_BLOCK_PROPS = {
  backgroundColor: 'default',
  textColor: 'default',
  textAlignment: 'left',
};

const createBlock = ({
  type,
  props,
  content,
  children = [],
}: {
  type: string;
  props: BlockNoteBlock['props'];
  content?: BlockNoteBlock['content'];
  children?: BlockNoteBlock[];
}): BlockNoteBlock => ({
  id: randomUUID(),
  type,
  props,
  ...(content === undefined ? {} : { content }),
  children,
});

const collectInlineRuns = (
  tokens: Token[],
  styles: BlockNoteStyle[],
  href: string | undefined,
  runs: InlineRun[],
): void => {
  for (const token of tokens) {
    const style = STYLE_BY_TOKEN_TYPE[token.type];

    if (style !== undefined) {
      collectInlineRuns(
        (token as Tokens.Generic).tokens ?? [],
        [...styles, style],
        href,
        runs,
      );
      continue;
    }

    switch (token.type) {
      case 'text':
        if (token.tokens !== undefined && token.tokens.length > 0) {
          collectInlineRuns(token.tokens, styles, href, runs);
        } else {
          runs.push({ text: token.text, styles, href });
        }
        break;
      case 'escape':
        runs.push({ text: token.text, styles, href });
        break;
      case 'codespan':
        runs.push({ text: token.text, styles: [...styles, 'code'], href });
        break;
      case 'br':
        runs.push({ text: '\n', styles, href });
        break;
      case 'link':
        collectInlineRuns(token.tokens ?? [], styles, token.href, runs);
        break;
      case 'image':
        runs.push({
          text: token.text.length > 0 ? token.text : token.href,
          styles,
          href: token.href,
        });
        break;
      case 'checkbox':
        break;
      default:
        // Raw HTML and anything else is kept as the literal text it was written as
        runs.push({ text: token.raw, styles, href });
    }
  }
};

const isSameRunFormat = (firstRun: InlineRun, secondRun: InlineRun) =>
  firstRun.href === secondRun.href &&
  firstRun.styles.length === secondRun.styles.length &&
  firstRun.styles.every((style) => secondRun.styles.includes(style));

const convertInlineTokens = (tokens: Token[]): BlockNoteInlineContent[] => {
  const runs: InlineRun[] = [];

  collectInlineRuns(tokens, [], undefined, runs);

  const mergedRuns: InlineRun[] = [];

  for (const run of runs) {
    const lastRun = mergedRuns[mergedRuns.length - 1];

    if (run.text.length === 0) {
      continue;
    }

    if (lastRun !== undefined && isSameRunFormat(lastRun, run)) {
      lastRun.text += run.text;
    } else {
      mergedRuns.push({ ...run });
    }
  }

  const content: BlockNoteInlineContent[] = [];

  for (const run of mergedRuns) {
    const styledText: BlockNoteStyledText = {
      type: 'text',
      text: run.text,
      styles: Object.fromEntries(run.styles.map((style) => [style, true])),
    };
    const lastContent = content[content.length - 1];

    if (run.href === undefined) {
      content.push(styledText);
    } else if (lastContent?.type === 'link' && lastContent.href === run.href) {
      lastContent.content.push(styledText);
    } else {
      content.push({ type: 'link', href: run.href, content: [styledText] });
    }
  }

  return content;
};

const isBlankContent = (content: BlockNoteInlineContent[]) =>
  content.every((item) => item.type === 'text' && item.text.trim() === '');

// Images are blocks in BlockNote, so a paragraph is split around them
const convertParagraph = (tokens: Token[]): BlockNoteBlock[] => {
  const blocks: BlockNoteBlock[] = [];
  let pendingTokens: Token[] = [];

  const flushParagraph = () => {
    const content = convertInlineTokens(pendingTokens);

    if (!isBlankContent(content)) {
      blocks.push(
        createBlock({
          type: 'paragraph',
          props: { ...DEFAULT_BLOCK_PROPS },
          content,
        }),
      );
    }

    pendingTokens = [];
  };

  for (const token of tokens) {
    if (token.type !== 'image') {
      pendingTokens.push(token);
      continue;
    }

    flushParagraph();
    blocks.push(
      createBlock({
        type: 'image',
        props: {
          textAlignment: 'left',
          backgroundColor: 'default',
          name: token.text,
          url: token.href,
          caption: '',
          showPreview: true,
        },
      }),
    );
  }

  flushParagraph();

  return blocks;
};

const convertListItem = (
  list: Tokens.List,
  item: Tokens.ListItem,
  index: number,
): BlockNoteBlock => {
  const tokens = item.tokens.filter(
    (token) => token.type !== 'checkbox' && token.type !== 'space',
  );
  const [firstToken, ...otherTokens] = tokens;
  const hasInlineFirstToken =
    firstToken?.type === 'text' || firstToken?.type === 'paragraph';

  const content = hasInlineFirstToken
    ? convertInlineTokens(firstToken.tokens ?? [])
    : [];
  const children = convertBlockTokens(
    hasInlineFirstToken ? otherTokens : tokens,
  );

  if (item.task) {
    return createBlock({
      type: 'checkListItem',
      props: { ...DEFAULT_BLOCK_PROPS, checked: item.checked === true },
      content,
      children,
    });
  }

  if (list.ordered) {
    const start = Number(list.start);

    return createBlock({
      type: 'numberedListItem',
      props:
        index === 0 && Number.isInteger(start) && start !== 1
          ? { ...DEFAULT_BLOCK_PROPS, start }
          : { ...DEFAULT_BLOCK_PROPS },
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

const convertTable = (table: Tokens.Table): BlockNoteBlock => {
  const toRow = (cells: Tokens.TableCell[]) => ({
    cells: cells.map((cell, columnIndex) => ({
      type: 'tableCell' as const,
      content: convertInlineTokens(cell.tokens),
      props: {
        colspan: 1,
        rowspan: 1,
        backgroundColor: 'default',
        textColor: 'default',
        textAlignment: table.align[columnIndex] ?? 'left',
      },
    })),
  });

  return createBlock({
    type: 'table',
    props: { textColor: 'default' },
    content: {
      type: 'tableContent',
      columnWidths: table.header.map(() => null),
      headerRows: 1,
      rows: [toRow(table.header), ...table.rows.map(toRow)],
    },
  });
};

const convertBlockTokens = (tokens: Token[]): BlockNoteBlock[] =>
  tokens.flatMap((token): BlockNoteBlock[] => {
    switch (token.type) {
      case 'space':
      case 'def':
        return [];
      case 'heading':
        return [
          createBlock({
            type: 'heading',
            props: {
              ...DEFAULT_BLOCK_PROPS,
              level: token.depth,
              isToggleable: false,
            },
            content: convertInlineTokens(token.tokens ?? []),
          }),
        ];
      case 'paragraph':
      case 'text':
        return convertParagraph(token.tokens ?? [token]);
      case 'code':
        return [
          createBlock({
            type: 'codeBlock',
            props: { language: token.lang || 'text' },
            content:
              token.text.length > 0
                ? [{ type: 'text', text: token.text, styles: {} }]
                : [],
          }),
        ];
      case 'hr':
        return [createBlock({ type: 'divider', props: {} })];
      case 'blockquote': {
        const quoteTokens = (token.tokens ?? []).filter(
          (quoteToken) => quoteToken.type !== 'space',
        );
        const inlineTokens = quoteTokens.flatMap((quoteToken, index) =>
          quoteToken.type === 'paragraph'
            ? [
                ...(index > 0 ? [{ type: 'br', raw: '\n' } as Tokens.Br] : []),
                ...(quoteToken.tokens ?? []),
              ]
            : [],
        );

        return [
          createBlock({
            type: 'quote',
            props: { backgroundColor: 'default', textColor: 'default' },
            content: convertInlineTokens(inlineTokens),
            children: convertBlockTokens(
              quoteTokens.filter(
                (quoteToken) => quoteToken.type !== 'paragraph',
              ),
            ),
          }),
        ];
      }
      case 'list':
        return token.items.map((item: Tokens.ListItem, index: number) =>
          convertListItem(token as Tokens.List, item, index),
        );
      case 'table':
        return [convertTable(token as Tokens.Table)];
      default:
        // Raw HTML blocks are kept as the literal text they were written as
        return [
          createBlock({
            type: 'paragraph',
            props: { ...DEFAULT_BLOCK_PROPS },
            content: [{ type: 'text', text: token.raw.trimEnd(), styles: {} }],
          }),
        ];
    }
  });

export const convertMarkdownToBlocknoteBlocks = (
  markdown: string,
): BlockNoteBlock[] => {
  const blocks = convertBlockTokens(new Lexer({ gfm: true }).lex(markdown));

  return blocks.length > 0
    ? blocks
    : [
        createBlock({
          type: 'paragraph',
          props: { ...DEFAULT_BLOCK_PROPS },
          content: [],
        }),
      ];
};
