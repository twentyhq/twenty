const ARRAY_LENGTH_REPLACEMENTS: [RegExp, string][] = [
  [/\bfavoriteRecordIds\.length\b/g, 'arrayLength(favoriteRecordIds)'],
  [/\bselectedRecords\.length\b/g, 'arrayLength(selectedRecords)'],
];

export const toExprEval = (raw: string): string =>
  ARRAY_LENGTH_REPLACEMENTS.reduce(
    (acc, [pattern, replacement]) => acc.replace(pattern, replacement),
    raw
      .replace(/!==/g, '!=')
      .replace(/===/g, '==')
      .replace(/&&/g, 'and')
      .replace(/\|\|/g, 'or')
      .replace(/!(?!=)/g, 'not ')
      .replace(/,(\s*\))/g, '$1'),
  );
