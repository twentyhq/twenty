import { type ObjectRecordOrderBy } from 'src/engine/api/graphql/workspace-query-builder/interfaces/object-record.interface';

import { parseOrderBy } from 'src/engine/api/rest/input-request-parsers/order-by-parser-utils/utils/parse-order-by-rest-request-common.util';
import { type AuthenticatedRequest } from 'src/engine/api/rest/types/authenticated-request';

export const parseOrderByForRecordsWithGroupByRestRequest = (
  request: AuthenticatedRequest,
): ObjectRecordOrderBy | undefined => {
  const orderByForRecordsWithGroupByQuery = request.query.order_by_for_records;

  return parseOrderBy(orderByForRecordsWithGroupByQuery);
};
