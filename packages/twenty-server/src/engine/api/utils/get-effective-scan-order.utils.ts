import { OrderByDirection } from 'twenty-shared/types';

import { isAscendingOrder } from 'src/engine/api/utils/is-ascending-order.utils';

export type EffectiveScanOrder = {
  isAscending: boolean;
  areNullsScannedLast: boolean;
};

// SQL ORDER BY and keyset WHERE conditions must both derive from this or they disagree (#24333)
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
