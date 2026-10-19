import { isNumber } from '@sniptt/guards';
import {
  type ObjectRecord,
  type RecordGqlOperationOrderBy,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { isAscendingOrderByDirection } from '@/object-record/graphql/utils/isAscendingOrderByDirection';
import { compareRecordsByOrderBy } from '@/object-record/utils/compareRecordsByOrderBy';
import { getOrderByPathAndDirection } from '@/object-record/utils/getOrderByPathAndDirection';

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
  const pathAndDirection = getOrderByPathAndDirection(orderBy);

  const isSortedByPositionOnly =
    pathAndDirection?.path.length === 1 &&
    pathAndDirection.path[0] === 'position';

  // An optimistic create carries the position input ('first' or 'last') until the server resolves it
  if (
    isSortedByPositionOnly &&
    (record.position === 'first' || record.position === 'last')
  ) {
    const isInsertedAtTop =
      (record.position === 'first') ===
      isAscendingOrderByDirection(pathAndDirection.direction);

    if (isInsertedAtTop) {
      return 0;
    }

    return totalNumberOfRows;
  }

  if (isSortedByPositionOnly && !isNumber(record.position)) {
    return null;
  }

  if (loadedRows.length === 0) {
    return null;
  }

  let low = 0;
  let high = loadedRows.length;

  while (low < high) {
    const middle = Math.floor((low + high) / 2);

    const comparison = compareRecordsByOrderBy({
      recordA: record,
      recordB: loadedRows[middle].record,
      orderBy,
    });

    if (!isDefined(comparison) || comparison === 0) {
      return null;
    }

    if (comparison < 0) {
      high = middle;
    } else {
      low = middle + 1;
    }
  }

  return loadedRows[low]?.rowIndex ?? totalNumberOfRows;
};
