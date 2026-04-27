import {
  RestInputRequestParserException,
  RestInputRequestParserExceptionCode,
} from 'src/engine/api/rest/input-request-parsers/rest-input-request-parser.exception';
import { type AuthenticatedRequest } from 'src/engine/api/rest/types/authenticated-request';
import { type RequestContext } from 'src/engine/api/rest/types/RequestContext';

const ENDING_BEFORE_ALIASES = [
  'cursor',
  'before',
  'endingBefore',
  'ending',
  'lastEnding',
  'endCursor',
];

export const parseEndingBeforeRestRequest = (
  request: AuthenticatedRequest | RequestContext,
): string | undefined => {
  const query = request.query;
  const endingBefore = query?.ending_before;

  if (typeof endingBefore === 'string') {
    return endingBefore;
  }

  if (endingBefore !== undefined) {
    if (Array.isArray(endingBefore)) {
      throw new RestInputRequestParserException(
        `Invalid 'ending_before' parameter. Expected a single string value.`,
        RestInputRequestParserExceptionCode.INVALID_ENDING_BEFORE_CURSOR_QUERY_PARAM,
      );
    }
    throw new RestInputRequestParserException(
      `Invalid 'ending_before' parameter. Expected a string.`,
      RestInputRequestParserExceptionCode.INVALID_ENDING_BEFORE_CURSOR_QUERY_PARAM,
    );
  }

  for (const alias of ENDING_BEFORE_ALIASES) {
    const aliasValue = query?.[alias];
    if (aliasValue !== undefined) {
      if (Array.isArray(aliasValue)) {
        throw new RestInputRequestParserException(
          `Invalid cursor parameter '${alias}'. Use 'ending_before' for pagination.`,
          RestInputRequestParserExceptionCode.INVALID_ENDING_BEFORE_CURSOR_QUERY_PARAM,
        );
      }
      if (typeof aliasValue !== 'string') {
        throw new RestInputRequestParserException(
          `Invalid cursor parameter '${alias}'. Use 'ending_before' for pagination.`,
          RestInputRequestParserExceptionCode.INVALID_ENDING_BEFORE_CURSOR_QUERY_PARAM,
        );
      }
      throw new RestInputRequestParserException(
        `Invalid cursor parameter '${alias}'. Use 'ending_before' for pagination.`,
        RestInputRequestParserExceptionCode.INVALID_ENDING_BEFORE_CURSOR_QUERY_PARAM,
      );
    }
  }

  return undefined;
};
