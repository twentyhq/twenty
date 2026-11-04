import { type ChatReferenceMatch } from '@/ai/types/ChatReferenceMatch';
import { Lexer, type Token, type Tokens } from 'marked';
import { isDefined } from 'twenty-shared/utils';

// marked tokens carry no source offsets, so a numbered marker before each reference shows which token it opens in.
const PROBE_MARKER = '\uFDD1';

const PROBED_REFERENCE_OPENING_REGEX = new RegExp(
  `${PROBE_MARKER}(\\d+)\\[\\[`,
  'g',
);

// Code, HTML, link targets and link definitions all need one of these, so without them every reference sits in text.
const NON_TEXT_MARKDOWN_SYNTAX_REGEX = /`|~~~|<|\]\(|\]:|\t|(?:^|\n) {4}/;

const isBackslashEscaped = ({
  text,
  index,
}: {
  text: string;
  index: number;
}): boolean => {
  let backslashCount = 0;

  while (text[index - backslashCount - 1] === '\\') {
    backslashCount++;
  }

  return backslashCount % 2 === 1;
};

const hasEscapedBrackets = ({
  text,
  reference,
}: {
  text: string;
  reference: Pick<ChatReferenceMatch, 'index' | 'fullMatch'>;
}): boolean =>
  isBackslashEscaped({ text, index: reference.index }) ||
  isBackslashEscaped({
    text,
    index: reference.index + reference.fullMatch.length - 2,
  });

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

const removeProbeMarkers = (text: string): string =>
  text.replaceAll(PROBE_MARKER, '');

const insertProbeMarkers = ({
  text,
  references,
}: {
  text: string;
  references: Pick<ChatReferenceMatch, 'index'>[];
}): string => {
  let probedText = '';
  let lastIndex = 0;

  for (const [referenceIndex, reference] of references.entries()) {
    probedText += `${removeProbeMarkers(text.slice(lastIndex, reference.index))}${PROBE_MARKER}${referenceIndex}`;
    lastIndex = reference.index;
  }

  return probedText + removeProbeMarkers(text.slice(lastIndex));
};

export const getChatReferencesInMarkdownText = ({
  text,
  references,
}: {
  text: string;
  references: ChatReferenceMatch[];
}): ChatReferenceMatch[] => {
  const unescapedReferences = references.filter(
    (reference) => !hasEscapedBrackets({ text, reference }),
  );

  if (
    unescapedReferences.length === 0 ||
    !NON_TEXT_MARKDOWN_SYNTAX_REGEX.test(text)
  ) {
    return unescapedReferences;
  }

  const textTokenReferenceIndexes = new Set(
    getInlineTextRaws(
      Lexer.lex(insertProbeMarkers({ text, references: unescapedReferences })),
    )
      .filter((raw) => raw.includes(PROBE_MARKER))
      .flatMap((raw) =>
        [...raw.matchAll(PROBED_REFERENCE_OPENING_REGEX)].map((match) =>
          Number(match[1]),
        ),
      ),
  );

  return unescapedReferences.filter((_, referenceIndex) =>
    textTokenReferenceIndexes.has(referenceIndex),
  );
};
