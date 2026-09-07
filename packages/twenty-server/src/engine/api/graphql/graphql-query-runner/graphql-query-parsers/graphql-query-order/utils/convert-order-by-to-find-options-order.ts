import { type OrderByDirection } from 'twenty-shared/types';

import { STANDARD_ERROR_MESSAGE } from 'src/engine/api/common/common-query-runners/errors/standard-error-message.constant';
import {
  GraphqlQueryRunnerException,
  GraphqlQueryRunnerExceptionCode,
} from 'src/engine/api/graphql/graphql-query-runner/errors/graphql-query-runner.exception';
import { isOrderByDirection } from 'src/engine/api/graphql/graphql-query-runner/graphql-query-parsers/graphql-query-order/utils/is-order-by-direction.util';
import { type OrderByClause } from 'src/engine/api/graphql/graphql-query-runner/graphql-query-parsers/graphql-query-order/graphql-query-order.parser';
import { getEffectiveScanOrder } from 'src/engine/api/utils/get-effective-scan-order.utils';

// Derives ORDER BY from the same scan-order primitive the keyset cursor
// conditions use, so the SQL scan and the WHERE continuation cannot disagree
export const convertOrderByToFindOptionsOrder = (
  direction: OrderByDirection,
  isForwardPagination = true,
): OrderByClause => {
  if (!isOrderByDirection(direction)) {
    throw new GraphqlQueryRunnerException(
      `Invalid direction: ${direction}`,
      GraphqlQueryRunnerExceptionCode.INVALID_DIRECTION,
      { userFriendlyMessage: STANDARD_ERROR_MESSAGE },
    );
  }

  const { isAscending, areNullsScannedLast } = getEffectiveScanOrder(
    direction,
    isForwardPagination,
  );

  return {
    order: isAscending ? 'ASC' : 'DESC',
    nulls: areNullsScannedLast ? 'NULLS LAST' : 'NULLS FIRST',
  };
};
