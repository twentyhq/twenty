import { type ChatReferenceMatch } from '@/ai/types/ChatReferenceMatch';
import { Lexer, type Token } from 'marked';
import { isDefined, isEmptyObject } from 'twenty-shared/utils';

// marked tokens carry no source offsets, so a numbered marker before each reference shows which token it opens in.
const PROBE_MARKER = '\uFDD1';

const PROBED_REFERENCE_OPENING_REGEX = new RegExp(
  `${PROBE_MARKER}(\\d+)\\[\\[`,
  'g',
);

// Code blocks, HTML and links need one of these; a code span needs a backtick on each side of the reference.
const NON_TEXT_BLOCK_SYNTAXES = ['```', '~~~', '<', '](', ']:', '\t', '    '];

const LINK_OR_HTML_SYNTAX_REGEX = /<|\]\(/;

const BACKTICK_RUN_OR_LINE_BREAK_REGEX = /`+|\n/g;

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

const getInlineTextRaws = (tokens: Token[]): string[] =>
  tokens.flatMap((token) => {
    if (token.type === 'text') {
      return [token.raw];
    }

    return 'tokens' in token && isDefined(token.tokens)
      ? getInlineTextRaws(token.tokens)
      : [];
  });

const getProbedReferenceIndexes = (text: string): number[] =>
  text.includes(PROBE_MARKER)
    ? [...text.matchAll(PROBED_REFERENCE_OPENING_REGEX)].map((match) =>
        Number(match[1]),
      )
    : [];

const hasProbeMarkerBetweenBackticks = (text: string): boolean =>
  text.slice(text.indexOf('`'), text.lastIndexOf('`')).includes(PROBE_MARKER);

const isEveryBacktickRunClosedOnItsLine = (text: string): boolean => {
  let openRunLength = 0;

  for (const [match] of text.matchAll(BACKTICK_RUN_OR_LINE_BREAK_REGEX)) {
    if (match === '\n') {
      if (openRunLength > 0) {
        return false;
      }
    } else if (openRunLength === 0) {
      openRunLength = match.length;
    } else if (match.length === openRunLength) {
      openRunLength = 0;
    }
  }

  return openRunLength === 0;
};

// When every backtick run closes on its own line, no code span crosses lines, so each line is checked alone.
const mayHideProbedReferences = (probedText: string): boolean => {
  if (NON_TEXT_BLOCK_SYNTAXES.some((syntax) => probedText.includes(syntax))) {
    return true;
  }

  if (!probedText.includes('`')) {
    return false;
  }

  if (
    probedText.includes('\\`') ||
    !isEveryBacktickRunClosedOnItsLine(probedText)
  ) {
    return hasProbeMarkerBetweenBackticks(probedText);
  }

  return probedText.split('\n').some(hasProbeMarkerBetweenBackticks);
};

const getTextReferenceIndexes = (probedText: string): Set<number> => {
  const lexer = new Lexer();

  lexer.blockTokens(probedText, []);

  const hasLinkDefinitions = !isEmptyObject(lexer.tokens.links);

  return new Set(
    lexer.inlineQueue
      .filter(({ src }) => src.includes(PROBE_MARKER))
      .flatMap(({ src }) =>
        hasLinkDefinitions ||
        LINK_OR_HTML_SYNTAX_REGEX.test(src) ||
        hasProbeMarkerBetweenBackticks(src)
          ? getInlineTextRaws(lexer.inlineTokens(src))
          : [src],
      )
      .flatMap(getProbedReferenceIndexes),
  );
};

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
    (reference) => !isBackslashEscaped({ text, index: reference.index }),
  );

  if (unescapedReferences.length === 0) {
    return [];
  }

  const probedText = insertProbeMarkers({
    text,
    references: unescapedReferences,
  });

  if (!mayHideProbedReferences(probedText)) {
    return unescapedReferences;
  }

  const textReferenceIndexes = getTextReferenceIndexes(probedText);

  return unescapedReferences.filter((_, referenceIndex) =>
    textReferenceIndexes.has(referenceIndex),
  );
};
