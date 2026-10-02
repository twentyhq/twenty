import { type Token, type Tokens, marked } from 'marked';

const BLOCK_TOKEN_TYPES = new Set([
  'paragraph',
  'heading',
  'blockquote',
  'list_item',
]);

const SKIPPED_TOKEN_TYPES = new Set(['code', 'html', 'hr', 'space', 'br']);

const getTokensText = (tokens: Token[]): string =>
  tokens.map(getTokenText).join('');

const getTableCellsText = (cells: Tokens.TableCell[]): string =>
  cells.map((cell) => `${getTokensText(cell.tokens)} `).join('');

const getTokenText = (token: Token): string => {
  if (SKIPPED_TOKEN_TYPES.has(token.type)) {
    return ' ';
  }

  if (token.type === 'list' && Array.isArray(token.items)) {
    return getTokensText(token.items);
  }

  if (token.type === 'table' && Array.isArray(token.rows)) {
    return [token.header, ...token.rows].map(getTableCellsText).join('');
  }

  if ('tokens' in token && Array.isArray(token.tokens)) {
    const text = getTokensText(token.tokens);

    return BLOCK_TOKEN_TYPES.has(token.type) ? `${text} ` : text;
  }

  return 'text' in token ? token.text : '';
};

export const getPlainTextFromMarkdown = (markdown: string): string =>
  getTokensText(marked.lexer(markdown)).replace(/\s+/g, ' ').trim();
