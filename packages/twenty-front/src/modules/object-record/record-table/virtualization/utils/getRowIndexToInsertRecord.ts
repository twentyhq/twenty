import {
  type ObjectRecord,
  type RecordGqlOperationOrderBy,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { compareRecordsByOrderBy } from '@/object-record/utils/compareRecordsByOrderBy';

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
