const TSQUERY_SPECIAL_CHARS = /[\\:'&|!()@<>]/g;
const WORD_SEPARATOR_CHARS = /[-_./]+/;

const escapeForTsQuery = (word: string): string =>
  word.replace(TSQUERY_SPECIAL_CHARS, '\\$&');

// Builds a tsquery expression for a single whitespace-delimited token.
// For tokens containing separator characters (hyphens, underscores, dots, slashes),
// produces (originalTerm:* | subPart1:* <op> subPart2:*) so the exact
// compound form ranks higher while individual parts still match.
const formatWordExpression = (word: string, operator: 'and' | 'or'): string => {
  const escapedWord = escapeForTsQuery(word);
  const subWords = word
    .split(WORD_SEPARATOR_CHARS)
    .filter((subWord) => subWord.length > 0);

  if (subWords.length <= 1) {
    return `${escapedWord}:*`;
  }

  const op = operator === 'and' ? '&' : '|';
  const subExpressions = subWords.map(
    (subWord) => `${escapeForTsQuery(subWord)}:*`,
  );

  return `(${escapedWord}:* | ${subExpressions.join(` ${op} `)})`;
};

export const formatSearchTerms = (
  searchTerm: string,
  operator: 'and' | 'or' = 'and',
): string => {
  if (searchTerm.trim() === '') {
    return '';
  }

  const words = searchTerm.trim().split(/\s+/);
  const op = operator === 'and' ? '&' : '|';

  return words
    .map((word) => formatWordExpression(word, operator))
    .join(` ${op} `);
};
