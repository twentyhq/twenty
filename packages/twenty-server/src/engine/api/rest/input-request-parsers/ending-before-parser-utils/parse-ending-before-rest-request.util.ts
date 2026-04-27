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

  for (const alias of ENDING_BEFORE_ALIASES) {
    const aliasValue = query?.[alias];
    if (typeof aliasValue === 'string') {
      throw new RestInputRequestParserException(
        `Invalid cursor parameter '${alias}'. Use 'ending_before' for pagination.`,
        RestInputRequestParserExceptionCode.INVALID_ENDING_BEFORE_CURSOR_QUERY_PARAM,
      );
    }
  }

  return undefined;
};
