//TODO : Refacto-common - remove this comment - This parser is a copy of the OrderByInputFactory without objectMetadata dependency. Validation will be done in common layer

import { OrderByDirection } from 'twenty-shared/types';

import { type ObjectRecordOrderBy } from 'src/engine/api/graphql/workspace-query-builder/interfaces/object-record.interface';

import { DEFAULT_ORDER_DIRECTION } from 'src/engine/api/rest/input-factories/order-by-input.factory';
import { addDefaultOrderById } from 'src/engine/api/rest/input-request-parsers/order-by-parser-utils/add-default-order-by-id.util';
import {
  RestInputRequestParserException,
  RestInputRequestParserExceptionCode,
} from 'src/engine/api/rest/input-request-parsers/rest-input-request-parser.exception';
import { type AuthenticatedRequest } from 'src/engine/api/rest/types/authenticated-request';

export const parseOrderByRestRequest = (
  request: AuthenticatedRequest,
): ObjectRecordOrderBy => {
  const orderByQuery = request.query.order_by;

  if (typeof orderByQuery !== 'string') {
    return addDefaultOrderById([{}]);
  }

  //orderByQuery = field_1[AscNullsFirst],field_2[DescNullsLast],field_3
  const orderByItems = orderByQuery.split(',');
  let result: Array<Record<string, OrderByDirection>> = [];
  let itemDirection = '';
  let itemFields = '';

  for (const orderByItem of orderByItems) {
    // orderByItem -> field_1[AscNullsFirst]
    if (orderByItem.includes('[') && orderByItem.includes(']')) {
      const [fieldName, directionWithRightBracket] = orderByItem.split('[');
      const direction = directionWithRightBracket.replace(']', '');

      // fields -> [field_1] ; direction -> AscNullsFirst
      if (!(direction in OrderByDirection)) {
        throw new RestInputRequestParserException(
          `'order_by' direction '${direction}' invalid. Allowed values are '${Object.values(
            OrderByDirection,
          ).join(
            "', '",
          )}'. eg: ?order_by=field_1[AscNullsFirst],field_2[DescNullsLast],field_3`,
          RestInputRequestParserExceptionCode.INVALID_ORDER_BY_QUERY_PARAM,
        );
      }

      itemDirection = direction;
      itemFields = fieldName;
    } else {
      // orderByItem -> field_3
      itemDirection = DEFAULT_ORDER_DIRECTION;
      itemFields = orderByItem;
    }

    let fieldResult = {};

    itemFields
      .split('.')
      .reverse()
      .forEach((field) => {
        if (Object.keys(fieldResult).length) {
          fieldResult = { [field]: fieldResult };
        } else {
          // @ts-expect-error legacy noImplicitAny
          fieldResult[field] = itemDirection;
        }
      }, itemDirection);

    const resultFields = Object.keys(fieldResult).map((key) => ({
      // @ts-expect-error legacy noImplicitAny
      [key]: fieldResult[key],
    }));

    result = [...result, ...resultFields];
  }

  return addDefaultOrderById(result);
};
