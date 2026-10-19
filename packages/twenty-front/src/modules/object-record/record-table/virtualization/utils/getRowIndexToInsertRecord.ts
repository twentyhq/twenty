import { isNumber } from '@sniptt/guards';
import { type RecordGqlOperationOrderBy } from 'twenty-shared/types';

import { isAscendingOrder } from '@/object-record/graphql/utils/isAscendingOrder';
import { isOrderByDirection } from '@/object-record/graphql/utils/isOrderByDirection';

export const getRowIndexToInsertRecord = ({
  loadedRows,
  position,
  totalNumberOfRows,
  orderBy,
}: {
  loadedRows: { rowIndex: number; position: number | null }[];
  position: number | 'first' | 'last' | null | undefined;
  totalNumberOfRows: number;
  orderBy: RecordGqlOperationOrderBy;
}): number | null => {
  const positionDirection = orderBy[0]?.position;

  if (!isOrderByDirection(positionDirection)) {
    return null;
  }

  const isAscending = isAscendingOrder(positionDirection);

  // An optimistic create carries the position input ('first' or 'last') until the server resolves it
  if (position === 'first' || position === 'last') {
    const isInsertedAtTop = (position === 'first') === isAscending;

    if (isInsertedAtTop) {
      return 0;
    }

    return totalNumberOfRows;
  }

  if (!isNumber(position) || loadedRows.length === 0) {
    return null;
  }

  let low = 0;
  let high = loadedRows.length;

  while (low < high) {
    const middle = Math.floor((low + high) / 2);
    const loadedPosition = loadedRows[middle].position;

    if (!isNumber(loadedPosition) || loadedPosition === position) {
      return null;
    }

    if (position < loadedPosition === isAscending) {
      high = middle;
    } else {
      low = middle + 1;
    }
  }

  return loadedRows[low]?.rowIndex ?? totalNumberOfRows;
};
