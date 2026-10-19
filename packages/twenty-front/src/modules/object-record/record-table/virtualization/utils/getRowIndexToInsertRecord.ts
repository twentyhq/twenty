import { isNumber } from '@sniptt/guards';
import {
  type ObjectRecord,
  type RecordGqlOperationOrderBy,
} from 'twenty-shared/types';

import { isAscendingOrderByDirection } from '@/object-record/graphql/utils/isAscendingOrderByDirection';
import { isOrderByDirection } from '@/object-record/graphql/utils/isOrderByDirection';

export const getRowIndexToInsertRecord = ({
  loadedRows,
  record,
  totalNumberOfRows,
  orderBy,
}: {
  loadedRows: { rowIndex: number; record: ObjectRecord }[];
  record: ObjectRecord;
  totalNumberOfRows: number;
  orderBy: RecordGqlOperationOrderBy;
}): number | null => {
  const positionDirection = orderBy[0]?.position;

  if (!isOrderByDirection(positionDirection)) {
    return null;
  }

  const isAscending = isAscendingOrderByDirection(positionDirection);

  // An optimistic create carries the position input ('first' or 'last') until the server resolves it
  if (record.position === 'first' || record.position === 'last') {
    const isInsertedAtTop = (record.position === 'first') === isAscending;

    if (isInsertedAtTop) {
      return 0;
    }

    return totalNumberOfRows;
  }

  const { position } = record;

  if (!isNumber(position) || loadedRows.length === 0) {
    return null;
  }

  let low = 0;
  let high = loadedRows.length;

  while (low < high) {
    const middle = Math.floor((low + high) / 2);
    const loadedPosition = loadedRows[middle].record.position;

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
