import {
  RestInputRequestParserException,
  RestInputRequestParserExceptionCode,
} from 'src/engine/api/rest/input-request-parsers/rest-input-request-parser.exception';
import { type AuthenticatedRequest } from 'src/engine/api/rest/types/authenticated-request';
import { type RequestContext } from 'src/engine/api/rest/types/RequestContext';

const STARTING_AFTER_ALIASES = [
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
  const query = request.query;
  const startingAfter = query?.starting_after;

  if (typeof startingAfter === 'string') {
    return startingAfter;
  }

  for (const alias of STARTING_AFTER_ALIASES) {
    const aliasValue = query?.[alias];
    if (typeof aliasValue === 'string') {
      throw new RestInputRequestParserException(
        `Invalid cursor parameter '${alias}'. Use 'starting_after' for pagination.`,
        RestInputRequestParserExceptionCode.INVALID_STARTING_AFTER_CURSOR_QUERY_PARAM,
      );
    }
  }

  return undefined;
};
