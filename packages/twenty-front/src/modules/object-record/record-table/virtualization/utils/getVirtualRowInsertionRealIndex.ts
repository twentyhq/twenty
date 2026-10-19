import {
  type ObjectRecord,
  type RecordGqlOperationOrderBy,
} from 'twenty-shared/types';

import { type LoadedVirtualRow } from '@/object-record/record-table/virtualization/types/LoadedVirtualRow';
import { findFirstLoadedVirtualRowSortedAfterRecord } from '@/object-record/record-table/virtualization/utils/findFirstLoadedVirtualRowSortedAfterRecord';

// Loaded rows at or after the returned index shift down by one; a record
// landing in an unloaded gap only needs the rows after the gap to shift
export const getVirtualRowInsertionRealIndex = ({
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

  switch (position.kind) {
    case 'after-all-loaded-rows':
      return totalNumberOfRecordsToVirtualize;
    case 'before-loaded-row':
      return position.row.realIndex;
    case 'ambiguous':
      return null;
  }
};
