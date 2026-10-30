import { isDefined } from 'twenty-shared/utils';

import {
  type FilterQuoteCharacter,
  getOpenQuoteAfterCharacter,
} from 'src/engine/api/rest/input-request-parsers/filter-parser-utils/get-open-quote-after-character.util';
import { ROOT_FILTER_CONJUNCTION_REGEX } from 'src/engine/api/rest/input-request-parsers/filter-parser-utils/parse-filter.util';

// The root regex also matches sibling groups such as `or(...),not(...)`
export const isWrappedInSingleRootConjunction = (
  filterQuery: string,
): boolean => {
  if (!ROOT_FILTER_CONJUNCTION_REGEX.test(filterQuery)) {
    return false;
  }

  let parenthesisCounter = 0;
  let openQuote: FilterQuoteCharacter | null = null;
  let previousCharacter: string | undefined;

  for (let index = 0; index < filterQuery.length; index++) {
    const character = filterQuery[index];

    openQuote = getOpenQuoteAfterCharacter({
      character,
      previousCharacter,
      openQuote,
    });
    previousCharacter = character;

    if (isDefined(openQuote)) {
      continue;
    }

    if (character === '(') {
      parenthesisCounter++;
    }

    if (character === ')') {
      parenthesisCounter--;

      if (parenthesisCounter === 0) {
        return index === filterQuery.length - 1;
      }
    }
  }

  return false;
};
