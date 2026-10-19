import {
  type ObjectRecord,
  type RecordGqlOperationOrderBy,
} from 'twenty-shared/types';

import { type LoadedVirtualRow } from '@/object-record/record-table/virtualization/types/LoadedVirtualRow';
import { findFirstLoadedVirtualRowSortedAfterRecord } from '@/object-record/record-table/virtualization/utils/findFirstLoadedVirtualRowSortedAfterRecord';

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
