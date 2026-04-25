import {
  RestInputRequestParserException,
  RestInputRequestParserExceptionCode,
} from 'src/engine/api/rest/input-request-parsers/rest-input-request-parser.exception';
import { type AuthenticatedRequest } from 'src/engine/api/rest/types/authenticated-request';
import { type RequestContext } from 'src/engine/api/rest/types/RequestContext';

const STARTING_AFTER_ALIASES = ['cursor', 'after', 'last_cursor'];

export const parseStartingAfterRestRequest = (
  request: AuthenticatedRequest | RequestContext,
): string | undefined => {
  const cursorQuery = request.query?.starting_after;

  if (typeof cursorQuery === 'string') {
    return cursorQuery;
  }

  for (const alias of STARTING_AFTER_ALIASES) {
    if (typeof request.query?.[alias] === 'string') {
      throw new RestInputRequestParserException(
        `'${alias}' is not a valid query parameter. Use 'starting_after' for forward pagination or 'ending_before' for backward pagination.`,
        RestInputRequestParserExceptionCode.INVALID_CURSOR_QUERY_PARAM,
      );
    }
  }

  return undefined;
};
