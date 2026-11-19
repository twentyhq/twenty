import { type OrderByDirection } from 'twenty-shared/types';

import { STANDARD_ERROR_MESSAGE } from 'src/engine/constants/standard-error-message.constant';
import {
  CommonQueryRunnerException,
  CommonQueryRunnerExceptionCode,
} from 'src/engine/api/common/common-query-runners/errors/common-query-runner.exception';
import { isOrderByDirection } from 'src/engine/api/common/common-query-parsers/common-query-order/utils/is-order-by-direction.util';
import { type OrderByClause } from 'src/engine/api/common/common-query-parsers/common-query-order/common-query-order.parser';
import { getEffectiveScanOrder } from 'src/engine/api/utils/get-effective-scan-order.util';

// Same scan-order primitive as the keyset cursor conditions, so ORDER BY and the WHERE continuation cannot disagree
export const convertOrderByToFindOptionsOrder = (
  direction: OrderByDirection,
  isForwardPagination = true,
): OrderByClause => {
  if (!isOrderByDirection(direction)) {
    throw new CommonQueryRunnerException(
      `Invalid direction: ${direction}`,
      CommonQueryRunnerExceptionCode.INVALID_DIRECTION,
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
