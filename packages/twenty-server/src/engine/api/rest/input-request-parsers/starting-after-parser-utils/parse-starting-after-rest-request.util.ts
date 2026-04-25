import {
  RestInputRequestParserException,
  RestInputRequestParserExceptionCode,
} from 'src/engine/api/rest/input-request-parsers/rest-input-request-parser.exception';
import { type AuthenticatedRequest } from 'src/engine/api/rest/types/authenticated-request';
import { type RequestContext } from 'src/engine/api/rest/types/RequestContext';

const STARTING_AFTER_WRONG_PARAM_NAMES = [
  'cursor',
  'after',
  'lastCursor',
  'last_cursor',
  'startingAfter',
  'page_token',
];

export const parseStartingAfterRestRequest = (
  request: AuthenticatedRequest | RequestContext,
): string | undefined => {
  const cursorQuery = request.query?.starting_after;

  if (typeof cursorQuery !== 'string') {
    for (const wrongName of STARTING_AFTER_WRONG_PARAM_NAMES) {
      if (typeof request.query?.[wrongName] === 'string') {
        throw new RestInputRequestParserException(
          `Unknown pagination parameter '${wrongName}'. Use 'starting_after' instead`,
          RestInputRequestParserExceptionCode.INVALID_CURSOR_QUERY_PARAM,
        );
      }
    }

    return undefined;
  }

  return cursorQuery;
};
