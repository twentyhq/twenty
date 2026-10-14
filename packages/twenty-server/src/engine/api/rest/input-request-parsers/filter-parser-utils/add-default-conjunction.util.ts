import { isDefined } from 'twenty-shared/utils';

import {
  type FilterQuoteCharacter,
  getOpenQuoteAfterCharacter,
} from 'src/engine/api/rest/input-request-parsers/filter-parser-utils/get-open-quote-after-character.util';
import {
  Conjunctions,
  ROOT_FILTER_CONJUNCTION_REGEX,
} from 'src/engine/api/rest/input-request-parsers/filter-parser-utils/parse-filter.util';

export const DEFAULT_CONJUNCTION = Conjunctions.and;

// The root regex also matches sibling groups such as `or(...),not(...)`, so
// the conjunction parenthesis must be the one closed by the last character
const isWrappedInSingleRootConjunction = (filterQuery: string): boolean => {
  if (!ROOT_FILTER_CONJUNCTION_REGEX.test(filterQuery)) {
    return false;
  }

  let parenthesisCounter = 0;
  let openQuote: FilterQuoteCharacter | null = null;
  let previousCharacter: string | undefined;

  for (let index = 0; index < filterQuery.length; index++) {
    const c = filterQuery[index];

    openQuote = getOpenQuoteAfterCharacter({
      character: c,
      previousCharacter,
      openQuote,
    });
    previousCharacter = c;

    if (isDefined(openQuote)) {
      continue;
    }

    if (c === '(') {
      parenthesisCounter++;
    }

    if (c === ')') {
      parenthesisCounter--;

      if (parenthesisCounter === 0) {
        return index === filterQuery.length - 1;
      }
    }
  }

  return false;
};

export const addDefaultConjunctionIfMissing = (filterQuery: string): string => {
  if (!isWrappedInSingleRootConjunction(filterQuery)) {
    return `${DEFAULT_CONJUNCTION}(${filterQuery})`;
  }

  return filterQuery;
};
