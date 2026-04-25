import {
  RestInputRequestParserException,
  RestInputRequestParserExceptionCode,
} from 'src/engine/api/rest/input-request-parsers/rest-input-request-parser.exception';
import { type AuthenticatedRequest } from 'src/engine/api/rest/types/authenticated-request';
import { type RequestContext } from 'src/engine/api/rest/types/RequestContext';

const ENDING_BEFORE_ALIASES = ['before'];

export const parseEndingBeforeRestRequest = (
  request: AuthenticatedRequest | RequestContext,
): string | undefined => {
  const cursorQuery = request.query?.ending_before;

  if (typeof cursorQuery === 'string') {
    return cursorQuery;
  }

  for (const alias of ENDING_BEFORE_ALIASES) {
    if (typeof request.query?.[alias] === 'string') {
      throw new RestInputRequestParserException(
        `'${alias}' is not a valid query parameter. Use 'ending_before' for backward pagination or 'starting_after' for forward pagination.`,
        RestInputRequestParserExceptionCode.INVALID_CURSOR_QUERY_PARAM,
      );
    }
  }

  return undefined;
};
