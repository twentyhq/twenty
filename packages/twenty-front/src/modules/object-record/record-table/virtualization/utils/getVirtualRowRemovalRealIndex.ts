import {
  type ObjectRecord,
  type RecordGqlOperationOrderBy,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { type LoadedVirtualRow } from '@/object-record/record-table/virtualization/types/LoadedVirtualRow';
import { findFirstLoadedVirtualRowSortedAfterRecord } from '@/object-record/record-table/virtualization/utils/findFirstLoadedVirtualRowSortedAfterRecord';

// For a record that is not loaded: the unloaded index it must occupy, or
// null when no such index exists between the loaded rows
export const getVirtualRowRemovalRealIndex = ({
  loadedRows,
  record,
  totalNumberOfRecordsToVirtualize,
  orderBy,
}: {
  loadedRows: LoadedVirtualRow[];
  record: ObjectRecord;
  totalNumberOfRecordsToVirtualize: number;
  orderBy: RecordGqlOperationOrderBy;
}): number | null => {
  if (loadedRows.length === 0) {
    return null;
  }

  const position = findFirstLoadedVirtualRowSortedAfterRecord({
    loadedRows,
    record,
    orderBy,
  });

  if (position.kind === 'ambiguous') {
    return null;
  }

  if (position.kind === 'after-all-loaded-rows') {
    const lastLoadedRow = loadedRows[loadedRows.length - 1];

    return lastLoadedRow.realIndex < totalNumberOfRecordsToVirtualize - 1
      ? totalNumberOfRecordsToVirtualize - 1
      : null;
  }

  const rowIndex = loadedRows.indexOf(position.row);
  const previousLoadedRow = loadedRows[rowIndex - 1];
  const removalRealIndex = position.row.realIndex - 1;

  const isGapBeforeRow =
    removalRealIndex >= 0 &&
    (!isDefined(previousLoadedRow) ||
      previousLoadedRow.realIndex < removalRealIndex);

  return isGapBeforeRow ? removalRealIndex : null;
};
