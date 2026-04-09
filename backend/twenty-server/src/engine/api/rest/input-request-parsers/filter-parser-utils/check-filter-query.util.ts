import { msg } from '@lingui/core/macro';

import {
  RestInputRequestParserException,
  RestInputRequestParserExceptionCode,
} from 'src/engine/api/rest/input-request-parsers/rest-input-request-parser.exception';

export const checkFilterQuery = (filterQuery: string): void => {
  const countOpenedBrackets = (filterQuery.match(/\(/g) || []).length;
  const countClosedBrackets = (filterQuery.match(/\)/g) || []).length;
  const diff = countOpenedBrackets - countClosedBrackets;

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
