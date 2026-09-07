import { OrderByDirection } from 'twenty-shared/types';

import { isAscendingOrder } from 'src/engine/api/utils/is-ascending-order.utils';

export type EffectiveScanOrder = {
  isAscending: boolean;
  areNullsScannedLast: boolean;
};

// The single definition of the scan a paginated query performs: backward
// pagination scans the exact reverse of the requested order, which flips both
// the direction and the side the NULL block sits on. Both the SQL ORDER BY and
// the keyset WHERE conditions must derive from this so they cannot disagree —
// their prior independent encodings are how issue #24333 happened.
export const getEffectiveScanOrder = (
  direction: OrderByDirection,
  isForwardPagination: boolean,
): EffectiveScanOrder => {
  const areNullsPresentedLast =
    direction === OrderByDirection.AscNullsLast ||
    direction === OrderByDirection.DescNullsLast;

  return {
    isAscending: isAscendingOrder(direction) === isForwardPagination,
    areNullsScannedLast: isForwardPagination
      ? areNullsPresentedLast
      : !areNullsPresentedLast,
  };
};
