import { OrderByDirection } from 'twenty-shared/types';

// Whether rows holding NULL in the ordered column come after the cursor's non-null
// region in the effective scan order. Backward pagination reverses the scan, which
// also swaps which side of it the NULL block sits on.
export const areNullsScannedAfterCursor = (
  direction: OrderByDirection,
  isForwardPagination: boolean,
): boolean => {
  const areNullsPresentedLast =
    direction === OrderByDirection.AscNullsLast ||
    direction === OrderByDirection.DescNullsLast;

  return isForwardPagination ? areNullsPresentedLast : !areNullsPresentedLast;
};
