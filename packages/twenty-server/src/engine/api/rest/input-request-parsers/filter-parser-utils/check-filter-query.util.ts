import { msg } from '@lingui/core/macro';
import { isDefined } from 'twenty-shared/utils';

import {
  type FilterQuoteCharacter,
  getOpenQuoteAfterCharacter,
} from 'src/engine/api/rest/input-request-parsers/filter-parser-utils/get-open-quote-after-character.util';
import {
  RestInputRequestParserException,
  RestInputRequestParserExceptionCode,
} from 'src/engine/api/rest/input-request-parsers/rest-input-request-parser.exception';

export const checkFilterQuery = (filterQuery: string): void => {
  let diff = 0;
  let openQuote: FilterQuoteCharacter | null = null;
  let previousCharacter: string | undefined;

  for (const character of filterQuery) {
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
      diff++;
    }

    if (character === ')') {
      diff--;
    }
  }

  if (diff !== 0) {
    const hint =
      diff > 0
        ? `${diff} close bracket${diff > 1 ? 's are' : ' is'}`
        : `${Math.abs(diff)} open bracket${
            Math.abs(diff) > 1 ? 's are' : ' is'
          }`;

    throw new RestInputRequestParserException(
      `'filter' invalid. ${hint} missing in the query`,
      RestInputRequestParserExceptionCode.INVALID_FILTER_QUERY_PARAM,
      { userFriendlyMessage: msg`Invalid filter parameter.` },
    );
  }

  return;
};
