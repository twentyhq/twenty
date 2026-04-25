import {
  RestInputRequestParserException,
  RestInputRequestParserExceptionCode,
} from 'src/engine/api/rest/input-request-parsers/rest-input-request-parser.exception';
import { type AuthenticatedRequest } from 'src/engine/api/rest/types/authenticated-request';
import { type RequestContext } from 'src/engine/api/rest/types/RequestContext';

const ENDING_BEFORE_WRONG_PARAM_NAMES = [
  'before',
  'endingBefore',
  'ending',
];

export const parseEndingBeforeRestRequest = (
  request: AuthenticatedRequest | RequestContext,
): string | undefined => {
  const cursorQuery = request.query?.ending_before;

  if (typeof cursorQuery !== 'string') {
    for (const wrongName of ENDING_BEFORE_WRONG_PARAM_NAMES) {
      if (typeof request.query?.[wrongName] === 'string') {
        throw new RestInputRequestParserException(
          `Unknown pagination parameter '${wrongName}'. Use 'ending_before' instead`,
          RestInputRequestParserExceptionCode.INVALID_CURSOR_QUERY_PARAM,
        );
      }
    }

    return undefined;
  }

  return cursorQuery;
};
