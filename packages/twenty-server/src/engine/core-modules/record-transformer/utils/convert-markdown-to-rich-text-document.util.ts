import { Lexer, type Token, type Tokens } from 'marked';
import {
  RICH_TEXT_MAX_HEADING_LEVEL,
  type RichTextDocument,
  TIPTAP_DOCUMENT_SCHEMA_VERSION,
  TIPTAP_NODE_TYPES,
  type TipTapNode,
} from 'twenty-shared/utils';

import {
  convertMarkdownInlineTokens,
  isImageToken,
  splitAroundImages,
} from 'src/engine/core-modules/record-transformer/utils/convert-markdown-inline-tokens.util';

type ListNodeType =
  | typeof TIPTAP_NODE_TYPES.BULLET_LIST
  | typeof TIPTAP_NODE_TYPES.ORDERED_LIST
  | typeof TIPTAP_NODE_TYPES.TASK_LIST;

const isBlankContent = (content: TipTapNode[]) =>
  content.every(
    (node) =>
      node.type === TIPTAP_NODE_TYPES.HARD_BREAK ||
      (node.text ?? '').trim() === '',
  );

const isListToken = (token: Token): token is Tokens.List =>
  token.type === 'list';

const isTableToken = (token: Token): token is Tokens.Table =>
  token.type === 'table';

const createParagraphNode = (content: TipTapNode[]): TipTapNode =>
  content.length > 0
    ? { type: TIPTAP_NODE_TYPES.PARAGRAPH, content }
    : { type: TIPTAP_NODE_TYPES.PARAGRAPH };

const convertImage = (image: Tokens.Image): TipTapNode => ({
  type: TIPTAP_NODE_TYPES.IMAGE,
  attrs: {
    src: image.href,
    alt: image.text.length > 0 ? image.text : null,
  },
});

const convertParagraph = (tokens: Token[]): TipTapNode[] => {
  const nodes: TipTapNode[] = [];
  let pendingTokens: Token[] = [];

  const flushParagraph = () => {
    const content = convertMarkdownInlineTokens(pendingTokens);

    if (!isBlankContent(content)) {
      nodes.push(createParagraphNode(content));
    }

    pendingTokens = [];
  };

  for (const token of tokens.flatMap(splitAroundImages)) {
    if (!isImageToken(token)) {
      pendingTokens.push(token);
      continue;
    }

    flushParagraph();
    nodes.push(convertImage(token));
  }

  flushParagraph();

  return nodes;
};

const convertListItem = (item: Tokens.ListItem): TipTapNode => {
  const tokens = item.tokens.filter(
    (token) => token.type !== 'checkbox' && token.type !== 'space',
  );
  const [firstToken, ...otherTokens] = tokens;
  const hasInlineFirstToken =
    firstToken?.type === 'text' || firstToken?.type === 'paragraph';

  const inlineParts = hasInlineFirstToken
    ? (firstToken.tokens ?? []).flatMap(splitAroundImages)
    : [];
  const content = [
    createParagraphNode(
      convertMarkdownInlineTokens(
        inlineParts.filter((token) => !isImageToken(token)),
      ),
    ),
    ...inlineParts.filter(isImageToken).map(convertImage),
    ...convertBlockTokens(hasInlineFirstToken ? otherTokens : tokens),
  ];

  return item.task
    ? {
        type: TIPTAP_NODE_TYPES.TASK_ITEM,
        attrs: { checked: item.checked ?? false },
        content,
      }
    : { type: TIPTAP_NODE_TYPES.LIST_ITEM, content };
};

const getListNodeType = (
  list: Tokens.List,
  item: Tokens.ListItem,
): ListNodeType => {
  if (item.task) {
    return TIPTAP_NODE_TYPES.TASK_LIST;
  }

  return list.ordered
    ? TIPTAP_NODE_TYPES.ORDERED_LIST
    : TIPTAP_NODE_TYPES.BULLET_LIST;
};

const convertList = (list: Tokens.List): TipTapNode[] => {
  const nodes: TipTapNode[] = [];
  const start = Number(list.start);
  const hasCustomStart = Number.isInteger(start) && start !== 1;

  for (const item of list.items) {
    const listNodeType = getListNodeType(list, item);
    const lastNode = nodes[nodes.length - 1];

    if (lastNode?.type === listNodeType) {
      lastNode.content?.push(convertListItem(item));
      continue;
    }

    const listNode: TipTapNode = {
      type: listNodeType,
      content: [convertListItem(item)],
    };

    if (
      listNodeType === TIPTAP_NODE_TYPES.ORDERED_LIST &&
      nodes.length === 0 &&
      hasCustomStart
    ) {
      listNode.attrs = { start };
    }

    nodes.push(listNode);
  }

  return nodes;
};

const convertTable = (table: Tokens.Table): TipTapNode => {
  const toRow = (
    cells: Tokens.TableCell[],
    cellType:
      | typeof TIPTAP_NODE_TYPES.TABLE_HEADER
      | typeof TIPTAP_NODE_TYPES.TABLE_CELL,
  ): TipTapNode => ({
    type: TIPTAP_NODE_TYPES.TABLE_ROW,
    content: cells.map((cell, columnIndex) => {
      const textAlign = table.align[columnIndex];
      const paragraph = createParagraphNode(
        convertMarkdownInlineTokens(cell.tokens),
      );

      return {
        type: cellType,
        content: [
          textAlign === 'center' || textAlign === 'right'
            ? { ...paragraph, attrs: { textAlign } }
            : paragraph,
        ],
      };
    }),
  });

  return {
    type: TIPTAP_NODE_TYPES.TABLE,
    content: [
      toRow(table.header, TIPTAP_NODE_TYPES.TABLE_HEADER),
      ...table.rows.map((row) => toRow(row, TIPTAP_NODE_TYPES.TABLE_CELL)),
    ],
  };
};

const convertBlockquote = (tokens: Token[]): TipTapNode => {
  const content = convertBlockTokens(tokens);

  return {
    type: TIPTAP_NODE_TYPES.BLOCKQUOTE,
    content: content.length > 0 ? content : [createParagraphNode([])],
  };
};

const convertBlockTokens = (tokens: Token[]): TipTapNode[] =>
  tokens.flatMap((token): TipTapNode[] => {
    switch (token.type) {
      case 'space':
      case 'def':
        return [];
      case 'heading':
        return [
          {
            type: TIPTAP_NODE_TYPES.HEADING,
            attrs: {
              level: Math.min(token.depth, RICH_TEXT_MAX_HEADING_LEVEL),
            },
            content: convertMarkdownInlineTokens(token.tokens ?? []),
          },
        ];
      case 'paragraph':
      case 'text':
        return convertParagraph(token.tokens ?? [token]);
      case 'code':
        return [
          {
            type: TIPTAP_NODE_TYPES.CODE_BLOCK,
            attrs: { language: token.lang || null },
            content:
              token.text.length > 0
                ? [{ type: TIPTAP_NODE_TYPES.TEXT, text: token.text }]
                : [],
          },
        ];
      case 'hr':
        return [{ type: TIPTAP_NODE_TYPES.DIVIDER }];
      case 'blockquote':
        return [convertBlockquote(token.tokens ?? [])];
      case 'list':
        return isListToken(token) ? convertList(token) : [];
      case 'table':
        return isTableToken(token) ? [convertTable(token)] : [];
      default:
        return convertParagraph([
          { type: 'text', raw: token.raw, text: token.raw.trimEnd() },
        ]);
    }
  });

export const convertMarkdownToRichTextDocument = (
  markdown: string,
): RichTextDocument => {
  const content = convertBlockTokens(new Lexer({ gfm: true }).lex(markdown));

  return {
    type: TIPTAP_NODE_TYPES.DOCUMENT,
    attrs: { schemaVersion: TIPTAP_DOCUMENT_SCHEMA_VERSION },
    content: content.length > 0 ? content : [createParagraphNode([])],
  };
};
