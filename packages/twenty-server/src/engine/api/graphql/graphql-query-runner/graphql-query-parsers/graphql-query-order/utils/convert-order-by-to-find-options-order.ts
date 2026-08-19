import { OrderByDirection } from 'twenty-shared/types';

import { STANDARD_ERROR_MESSAGE } from 'src/engine/api/common/common-query-runners/errors/standard-error-message.constant';
import {
  GraphqlQueryRunnerException,
  GraphqlQueryRunnerExceptionCode,
} from 'src/engine/api/graphql/graphql-query-runner/errors/graphql-query-runner.exception';
import { type OrderByClause } from 'src/engine/api/graphql/graphql-query-runner/graphql-query-parsers/graphql-query-order/graphql-query-order.parser';

export const convertOrderByToFindOptionsOrder = (
  direction: OrderByDirection,
  isForwardPagination = true,
): OrderByClause => {
  // Backward pagination scans in the exact reverse of the requested order, which
  // reverses the NULLS placement along with the direction
  switch (direction) {
    case OrderByDirection.AscNullsFirst:
      return isForwardPagination
        ? { order: 'ASC', nulls: 'NULLS FIRST' }
        : { order: 'DESC', nulls: 'NULLS LAST' };
    case OrderByDirection.AscNullsLast:
      return isForwardPagination
        ? { order: 'ASC', nulls: 'NULLS LAST' }
        : { order: 'DESC', nulls: 'NULLS FIRST' };
    case OrderByDirection.DescNullsFirst:
      return isForwardPagination
        ? { order: 'DESC', nulls: 'NULLS FIRST' }
        : { order: 'ASC', nulls: 'NULLS LAST' };
    case OrderByDirection.DescNullsLast:
      return isForwardPagination
        ? { order: 'DESC', nulls: 'NULLS LAST' }
        : { order: 'ASC', nulls: 'NULLS FIRST' };
    default:
      throw new GraphqlQueryRunnerException(
        `Invalid direction: ${direction}`,
        GraphqlQueryRunnerExceptionCode.INVALID_DIRECTION,
        { userFriendlyMessage: STANDARD_ERROR_MESSAGE },
      );
  }
};
