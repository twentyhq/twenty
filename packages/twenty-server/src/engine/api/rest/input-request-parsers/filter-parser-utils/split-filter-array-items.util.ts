import { isDefined } from 'twenty-shared/utils';

import {
  type FilterQuoteCharacter,
  getOpenQuoteAfterCharacter,
} from 'src/engine/api/rest/input-request-parsers/filter-parser-utils/get-open-quote-after-character.util';

export const splitFilterArrayItems = (arrayContent: string): string[] => {
  const items: string[] = [];
  let currentItem = '';
  let openQuote: FilterQuoteCharacter | null = null;
  let previousCharacter = '[';

  for (const character of arrayContent) {
    openQuote = getOpenQuoteAfterCharacter({
      character,
      previousCharacter,
      openQuote,
    });
    previousCharacter = character;

    if (character === ',' && !isDefined(openQuote)) {
      items.push(currentItem);
      currentItem = '';
      continue;
    }

    currentItem += character;
  }

  items.push(currentItem);

  return items;
};
