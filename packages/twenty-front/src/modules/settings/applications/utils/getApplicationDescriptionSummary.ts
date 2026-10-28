import { type Token, marked } from 'marked';
import { getPlainTextFromMarkdownTokens } from '~/utils/string/getPlainTextFromMarkdown';

const withoutImageTokens = (tokens: Token[]): Token[] =>
  tokens.flatMap((token) => {
    if (token.type === 'image') {
      return [];
    }

    if (token.type === 'list' && Array.isArray(token.items)) {
      return [{ ...token, items: withoutImageTokens(token.items) }];
    }

    if ('tokens' in token && Array.isArray(token.tokens)) {
      return [{ ...token, tokens: withoutImageTokens(token.tokens) }];
    }

    return [token];
  });

export const getApplicationDescriptionSummary = (
  description?: string | null,
): string => {
  if (!description) {
    return '';
  }

  for (const block of marked.lexer(description)) {
    const summary = getPlainTextFromMarkdownTokens(withoutImageTokens([block]));

    if (summary.length > 0) {
      return summary;
    }
  }

  return '';
};
