import {
  type ObjectRecord,
  type RecordGqlOperationOrderBy,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { type LoadedVirtualRow } from '@/object-record/record-table/virtualization/types/LoadedVirtualRow';
import { compareRecordsByOrderBy } from '@/object-record/utils/compareRecordsByOrderBy';

type FirstLoadedVirtualRowSortedAfterRecord =
  | { kind: 'after-all-loaded-rows' }
  | { kind: 'before-loaded-row'; row: LoadedVirtualRow }
  | { kind: 'ambiguous' };

// Binary search over rows sorted by real index; a tie or an incomparable
// value leaves the position unknown
export const findFirstLoadedVirtualRowSortedAfterRecord = ({
  loadedRows,
  record,
  orderBy,
}: {
  loadedRows: LoadedVirtualRow[];
  record: ObjectRecord;
  orderBy: RecordGqlOperationOrderBy;
}): FirstLoadedVirtualRowSortedAfterRecord => {
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
      return { kind: 'ambiguous' };
    }

    if (comparison < 0) {
      high = middle;
    } else {
      low = middle + 1;
    }
  }

  const row = loadedRows[low];

  return isDefined(row)
    ? { kind: 'before-loaded-row', row }
    : { kind: 'after-all-loaded-rows' };
};
