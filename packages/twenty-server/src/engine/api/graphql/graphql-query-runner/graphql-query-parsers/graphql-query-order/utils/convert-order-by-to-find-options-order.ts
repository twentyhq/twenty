import { OrderByDirection } from 'twenty-shared/types';

import { STANDARD_ERROR_MESSAGE } from 'src/engine/api/common/common-query-runners/errors/standard-error-message.constant';
import {
  GraphqlQueryRunnerException,
  GraphqlQueryRunnerExceptionCode,
} from 'src/engine/api/graphql/graphql-query-runner/errors/graphql-query-runner.exception';
import { type OrderByCondition } from 'src/engine/api/graphql/graphql-query-runner/graphql-query-parsers/graphql-query-order/graphql-query-order.parser';

export const convertOrderByToFindOptionsOrder = (
  direction: OrderByDirection,
  isForwardPagination = true,
): OrderByCondition => {
  switch (direction) {
    case OrderByDirection.AscNullsFirst:
      return {
        order: isForwardPagination ? 'ASC' : 'DESC',
        nulls: 'NULLS FIRST',
      };
    case OrderByDirection.AscNullsLast:
      return {
        order: isForwardPagination ? 'ASC' : 'DESC',
        nulls: 'NULLS LAST',
      };
    case OrderByDirection.DescNullsFirst:
      return {
        order: isForwardPagination ? 'DESC' : 'ASC',
        nulls: 'NULLS FIRST',
      };
    case OrderByDirection.DescNullsLast:
      return {
        order: isForwardPagination ? 'DESC' : 'ASC',
        nulls: 'NULLS LAST',
      };
    default:
      throw new GraphqlQueryRunnerException(
        `Invalid direction: ${direction}`,
        GraphqlQueryRunnerExceptionCode.INVALID_DIRECTION,
        { userFriendlyMessage: STANDARD_ERROR_MESSAGE },
      );
  }
};
