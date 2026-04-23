import { BadRequestException } from '@nestjs/common';

import { type OrderByWithGroupBy } from 'twenty-shared/types';

import { RestInputRequestParserExceptionCode } from 'src/engine/api/rest/input-request-parsers/rest-input-request-parser.exception';
import { type AuthenticatedRequest } from 'src/engine/api/rest/types/authenticated-request';

export const parseOrderByWithGroupByRestRequest = (
  request: AuthenticatedRequest,
): OrderByWithGroupBy | undefined => {
  const orderByWithGroupByQuery = request.query.order_by;

  if (typeof orderByWithGroupByQuery !== 'string') return undefined;

  try {
    return JSON.parse(orderByWithGroupByQuery);
  } catch {
    throw new BadRequestException(
      `Invalid order_by query parameter - should be a valid array of objects - ex: [{"firstField": "AscNullsFirst"}, {"secondField": {"subField": "DescNullsLast"}}, {"aggregate": {"aggregateField": "DescNullsLast"}}, {dateField: {"orderBy": "AscNullsFirst", "granularity": "DAY"}}]`,
      RestInputRequestParserExceptionCode.INVALID_ORDER_BY_WITH_GROUP_BY_QUERY_PARAM,
    );
  }
};
