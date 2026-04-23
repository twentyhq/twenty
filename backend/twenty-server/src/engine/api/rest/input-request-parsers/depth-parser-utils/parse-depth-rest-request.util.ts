import { STANDARD_ERROR_MESSAGE } from 'src/engine/api/common/common-query-runners/errors/standard-error-message.constant';
import {
  RestInputRequestParserException,
  RestInputRequestParserExceptionCode,
} from 'src/engine/api/rest/input-request-parsers/rest-input-request-parser.exception';
import { type Depth } from 'src/engine/api/rest/input-request-parsers/types/depth.type';
import { type AuthenticatedRequest } from 'src/engine/api/rest/types/authenticated-request';

export const parseDepthRestRequest = (request: AuthenticatedRequest): Depth => {
  if (!request.query.depth) {
    return 0;
  }

  const depth = +request.query.depth as Depth;

  const ALLOWED_DEPTH_VALUES: Depth[] = [0, 1];

  if (isNaN(depth) || !ALLOWED_DEPTH_VALUES.includes(depth)) {
    throw new RestInputRequestParserException(
      `'depth=${
        request.query.depth
      }' parameter invalid. Allowed values are ${ALLOWED_DEPTH_VALUES.join(
        ', ',
      )}`,
      RestInputRequestParserExceptionCode.INVALID_DEPTH_QUERY_PARAM,
      { userFriendlyMessage: STANDARD_ERROR_MESSAGE },
    );
  }

  return depth;
};
