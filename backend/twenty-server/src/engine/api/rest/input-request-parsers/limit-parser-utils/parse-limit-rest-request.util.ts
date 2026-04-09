import {
  QUERY_DEFAULT_LIMIT_RECORDS,
  QUERY_MAX_RECORDS,
} from 'twenty-shared/constants';

import {
  RestInputRequestParserException,
  RestInputRequestParserExceptionCode,
} from 'src/engine/api/rest/input-request-parsers/rest-input-request-parser.exception';
import { type AuthenticatedRequest } from 'src/engine/api/rest/types/authenticated-request';
import { type RequestContext } from 'src/engine/api/rest/types/RequestContext';

export const parseLimitRestRequest = (
  request: AuthenticatedRequest | RequestContext,
  defaultLimit = QUERY_DEFAULT_LIMIT_RECORDS,
): number => {
  if (!request.query?.limit) {
    return defaultLimit;
  }
  const limit = +request.query.limit;

  if (isNaN(limit) || limit < 0) {
    throw new RestInputRequestParserException(
      `limit '${request.query.limit}' is invalid. Should be an integer`,
      RestInputRequestParserExceptionCode.INVALID_LIMIT_QUERY_PARAM,
    );
  }

  return Math.min(limit, QUERY_MAX_RECORDS);
};
