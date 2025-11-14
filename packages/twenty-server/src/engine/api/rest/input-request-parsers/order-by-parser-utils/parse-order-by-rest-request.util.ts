//TODO : Refacto-common - remove this comment - This parser is a copy of the OrderByInputFactory without objectMetadata dependency. Validation will be done in common layer

import { type ObjectRecordOrderBy } from 'src/engine/api/graphql/workspace-query-builder/interfaces/object-record.interface';

import { parseOrderByRestRequestCommon } from 'src/engine/api/rest/input-request-parsers/order-by-parser-utils/utils/parse-order-by-rest-request-common.util';
import { type AuthenticatedRequest } from 'src/engine/api/rest/types/authenticated-request';

export const parseOrderByRestRequest = (
  request: AuthenticatedRequest,
): ObjectRecordOrderBy => {
  const orderByQuery = request.query.order_by;

  return parseOrderByRestRequestCommon(orderByQuery);
};
