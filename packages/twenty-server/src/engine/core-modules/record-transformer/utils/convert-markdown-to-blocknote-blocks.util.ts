import { randomUUID } from 'crypto';

import type { PartialBlock } from '@blocknote/core';
import { Lexer, type Token, type Tokens } from 'marked';
import { isNonEmptyArray, isSafeUrl } from 'twenty-shared/utils';

import {
  convertMarkdownInlineTokens,
  getChildTokens,
  type InlineContent,
} from 'src/engine/core-modules/record-transformer/utils/convert-markdown-inline-tokens.util';

const DEFAULT_BLOCK_PROPS = {
  backgroundColor: 'default',
  textColor: 'default',
  textAlignment: 'left',
} as const;

const createBlock = (block: PartialBlock): PartialBlock => ({
  id: randomUUID(),
  ...block,
  children: block.children ?? [],
});

const isBlankContent = (content: InlineContent[]) =>
  content.every((item) => item.type === 'text' && item.text.trim() === '');

const LINE_BREAK_TOKEN: Tokens.Br = { type: 'br', raw: '\n' };

const isListToken = (token: Token): token is Tokens.List =>
  token.type === 'list';

const isTableToken = (token: Token): token is Tokens.Table =>
  token.type === 'table';

const isImageToken = (token: Token): token is Tokens.Image =>
  token.type === 'image' && isSafeUrl(token.href);

const convertImage = (image: Tokens.Image): PartialBlock =>
  createBlock({
    type: 'image',
    props: {
      textAlignment: 'left',
      backgroundColor: 'default',
      name: image.text,
      url: image.href,
      caption: '',
      showPreview: true,
    },
  });

const splitAroundImages = (token: Token): Token[] => {
  const childTokens = getChildTokens(token);

  if (isImageToken(token) || !isNonEmptyArray(childTokens)) {
    return [token];
  }

  const parts: Token[] = [];
  let pendingChildTokens: Token[] = [];

  const flushChildTokens = () => {
    if (pendingChildTokens.length > 0) {
      const partToken: Tokens.Generic = {
        ...token,
        tokens: pendingChildTokens,
      };

      parts.push(partToken);
      pendingChildTokens = [];
    }
  };

  for (const childPart of childTokens.flatMap(splitAroundImages)) {
    if (isImageToken(childPart)) {
      flushChildTokens();
      parts.push(childPart);
    } else {
      pendingChildTokens.push(childPart);
    }
  }

  flushChildTokens();

  return parts;
};

const convertParagraph = (tokens: Token[]): PartialBlock[] => {
  const blocks: PartialBlock[] = [];
  let pendingTokens: Token[] = [];

  const flushParagraph = () => {
    const content = convertMarkdownInlineTokens(pendingTokens);

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

  for (const token of tokens.flatMap(splitAroundImages)) {
    if (!isImageToken(token)) {
      pendingTokens.push(token);
      continue;
    }

    flushParagraph();
    blocks.push(convertImage(token));
  }

  flushParagraph();

  return blocks;
};

const convertListItem = ({
  list,
  item,
  index,
}: {
  list: Tokens.List;
  item: Tokens.ListItem;
  index: number;
}): PartialBlock => {
  const tokens = item.tokens.filter(
    (token) => token.type !== 'checkbox' && token.type !== 'space',
  );
  const [firstToken, ...otherTokens] = tokens;
  const hasInlineFirstToken =
    firstToken?.type === 'text' || firstToken?.type === 'paragraph';

  const inlineParts = hasInlineFirstToken
    ? (firstToken.tokens ?? []).flatMap(splitAroundImages)
    : [];
  const content = convertMarkdownInlineTokens(
    inlineParts.filter((token) => !isImageToken(token)),
  );
  const children = [
    ...inlineParts.filter(isImageToken).map(convertImage),
    ...convertBlockTokens(hasInlineFirstToken ? otherTokens : tokens),
  ];

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

const collectQuoteLines = (tokens: Token[]): Token[][] =>
  tokens.flatMap((token): Token[][] => {
    switch (token.type) {
      case 'space':
        return [];
      case 'paragraph':
      case 'text':
      case 'heading':
        return [getChildTokens(token)];
      case 'list':
        return isListToken(token)
          ? token.items.flatMap((item) => collectQuoteLines(item.tokens))
          : [];
      case 'blockquote':
        return collectQuoteLines(getChildTokens(token));
      case 'code':
        return [[{ type: 'text', raw: token.raw, text: token.text }]];
      default:
        return [[{ type: 'text', raw: token.raw, text: token.raw.trimEnd() }]];
    }
  });

const convertTable = (table: Tokens.Table): PartialBlock => {
  const toRow = (cells: Tokens.TableCell[]) => ({
    cells: cells.map((cell, columnIndex) => ({
      type: 'tableCell' as const,
      content: convertMarkdownInlineTokens(cell.tokens),
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
      columnWidths: table.header.map(() => undefined),
      headerRows: 1,
      rows: [toRow(table.header), ...table.rows.map(toRow)],
    },
  });
};

const convertBlockTokens = (tokens: Token[]): PartialBlock[] =>
  tokens.flatMap((token): PartialBlock[] => {
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
            content: convertMarkdownInlineTokens(token.tokens ?? []),
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
        const quoteLines = collectQuoteLines(token.tokens ?? []).map((line) =>
          line.flatMap(splitAroundImages),
        );
        const quoteTextLines = quoteLines
          .map((line) => line.filter((part) => !isImageToken(part)))
          .filter(isNonEmptyArray);

        return [
          createBlock({
            type: 'quote',
            props: { backgroundColor: 'default', textColor: 'default' },
            content: convertMarkdownInlineTokens(
              quoteTextLines.flatMap((line, index) =>
                index > 0 ? [LINE_BREAK_TOKEN, ...line] : line,
              ),
            ),
          }),
          ...quoteLines.flat().filter(isImageToken).map(convertImage),
        ];
      }
      case 'list':
        return isListToken(token)
          ? token.items.map((item, index) =>
              convertListItem({ list: token, item, index }),
            )
          : [];
      case 'table':
        return isTableToken(token) ? [convertTable(token)] : [];
      default:
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
): PartialBlock[] => {
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
