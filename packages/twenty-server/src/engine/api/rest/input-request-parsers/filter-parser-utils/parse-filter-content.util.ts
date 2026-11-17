import {
  type FilterQuoteCharacter,
  getOpenQuoteAfterCharacter,
  isDefined,
} from 'twenty-shared/utils';

export const parseFilterContent = (filterQuery: string): string[] => {
  let isWithinBrackets = false;
  let openQuote: FilterQuoteCharacter | null = null;
  let previousCharacter: string | undefined;
  let parenthesisCounter = 0;
  const predicates: string[] = [];
  let currentPredicates = '';

  for (const c of filterQuery) {
    let shouldPersistCharacter = parenthesisCounter >= 1;

    openQuote = getOpenQuoteAfterCharacter({
      character: c,
      previousCharacter,
      openQuote,
    });
    previousCharacter = c;

    if (isDefined(openQuote)) {
      if (shouldPersistCharacter) {
        currentPredicates += c;
      }
      continue;
    }

    if (c === '(') {
      parenthesisCounter++;
    }

    if (c === ')') {
      parenthesisCounter--;
      shouldPersistCharacter = parenthesisCounter >= 1;
    }

    if (['[', ']'].includes(c)) {
      isWithinBrackets = !isWithinBrackets;
    }

    if (c === ',' && parenthesisCounter === 1 && !isWithinBrackets) {
      predicates.push(currentPredicates);
      currentPredicates = '';
      shouldPersistCharacter = false;
    }

    if (shouldPersistCharacter) {
      currentPredicates += c;
    }
  }

  predicates.push(currentPredicates);

  return predicates;
};
