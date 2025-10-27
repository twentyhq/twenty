import { BadRequestException } from '@nestjs/common';

import { type ObjectRecordOrderBy } from 'src/engine/api/graphql/workspace-query-builder/interfaces/object-record.interface';

import { RestInputRequestParserExceptionCode } from 'src/engine/api/rest/input-request-parsers/rest-input-request-parser.exception';
import { type AuthenticatedRequest } from 'src/engine/api/rest/types/authenticated-request';

export const parseOrderByForRecordsWithGroupByRestRequest = (
  request: AuthenticatedRequest,
): ObjectRecordOrderBy | undefined => {
  const orderByForRecordsWithGroupByQuery = request.query.order_by_for_records;

  if (typeof orderByForRecordsWithGroupByQuery !== 'string') return undefined;

  try {
    return JSON.parse(orderByForRecordsWithGroupByQuery);
  } catch {
    throw new BadRequestException(
      `Invalid order_by_for_records query parameter - should be a valid array of objects - ex: [{"firstField": "AscNullsFirst"}, {"secondField": {"subField": "DescNullsLast"}}, {"aggregate": {"aggregateField": "DescNullsLast"}}, {dateField: {"orderBy": "AscNullsFirst", "granularity": "DAY"}}]`,
      RestInputRequestParserExceptionCode.INVALID_ORDER_BY_WITH_GROUP_BY_QUERY_PARAM,
    );
  }
};
