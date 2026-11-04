import { type ChatReferenceMatch } from '@/ai/types/ChatReferenceMatch';
import { Lexer, type Token, type Tokens } from 'marked';
import { isDefined } from 'twenty-shared/utils';

// marked tokens carry no source offsets, so a numbered marker before each reference shows which token it opens in.
const PROBE_MARKER = '\uFDD1';

const PROBED_REFERENCE_OPENING_REGEX = new RegExp(
  `${PROBE_MARKER}(\\d+)\\[\\[`,
  'g',
);

const isBackslashEscaped = (text: string, index: number): boolean => {
  let backslashCount = 0;

  while (text[index - backslashCount - 1] === '\\') {
    backslashCount++;
  }

  return backslashCount % 2 === 1;
};

const hasEscapedBrackets = (
  text: string,
  reference: ChatReferenceMatch,
): boolean =>
  isBackslashEscaped(text, reference.index) ||
  isBackslashEscaped(text, reference.index + reference.fullMatch.length - 2);

const isListToken = (token: Token): token is Tokens.List =>
  token.type === 'list';

const isTableToken = (token: Token): token is Tokens.Table =>
  token.type === 'table';

const isInlineTextToken = (token: Token): token is Tokens.Text =>
  token.type === 'text' && !isDefined(token.tokens);

const getChildTokens = (token: Token): Token[] => {
  if (isListToken(token)) {
    return token.items;
  }

  if (isTableToken(token)) {
    return [...token.header, ...token.rows.flat()].flatMap(
      (cell) => cell.tokens,
    );
  }

  return 'tokens' in token && isDefined(token.tokens) ? token.tokens : [];
};

const getInlineTextRaws = (tokens: Token[]): string[] =>
  tokens.flatMap((token) =>
    isInlineTextToken(token)
      ? [token.raw]
      : getInlineTextRaws(getChildTokens(token)),
  );

const insertProbeMarkers = (
  text: string,
  references: ChatReferenceMatch[],
): string => {
  let probedText = '';
  let lastIndex = 0;

  for (const [referenceIndex, reference] of references.entries()) {
    probedText += `${text.slice(lastIndex, reference.index)}${PROBE_MARKER}${referenceIndex}`;
    lastIndex = reference.index;
  }

  return probedText + text.slice(lastIndex);
};

export const getChatReferencesInMarkdownText = ({
  text,
  references,
}: {
  text: string;
  references: ChatReferenceMatch[];
}): ChatReferenceMatch[] => {
  const unescapedReferences = references.filter(
    (reference) => !hasEscapedBrackets(text, reference),
  );

  if (unescapedReferences.length === 0) {
    return [];
  }

  const textTokenReferenceIndexes = new Set(
    getInlineTextRaws(
      Lexer.lex(insertProbeMarkers(text, unescapedReferences)),
    ).flatMap((raw) =>
      [...raw.matchAll(PROBED_REFERENCE_OPENING_REGEX)].map((match) =>
        Number(match[1]),
      ),
    ),
  );

  return unescapedReferences.filter((_, referenceIndex) =>
    textTokenReferenceIndexes.has(referenceIndex),
  );
};
