import {
  type ObjectRecord,
  type RecordGqlOperationOrderBy,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { type RecordTableVirtualizationEffect } from '@/object-record/record-table/virtualization/types/RecordTableVirtualizationEffect';
import { compareRecordsByOrderBy } from '@/object-record/utils/compareRecordsByOrderBy';

// A record that sorts strictly after the last loaded row lands past the
// loaded window, unless that window already reaches the end of the table.
export const getRecordTableVirtualizationEffectForRecordOutsideWindow = ({
  record,
  lastLoadedRecord,
  lastLoadedRealIndex,
  totalNumberOfRecordsToVirtualize,
  orderBy,
}: {
  record: ObjectRecord;
  lastLoadedRecord: ObjectRecord | null | undefined;
  lastLoadedRealIndex: number | null;
  totalNumberOfRecordsToVirtualize: number | null;
  orderBy: RecordGqlOperationOrderBy;
}): RecordTableVirtualizationEffect => {
  if (
    !isDefined(lastLoadedRecord) ||
    !isDefined(lastLoadedRealIndex) ||
    !isDefined(totalNumberOfRecordsToVirtualize)
  ) {
    return 'reset';
  }

  const windowReachesEndOfTable =
    lastLoadedRealIndex >= totalNumberOfRecordsToVirtualize - 1;

  if (windowReachesEndOfTable) {
    return 'reset';
  }

  const comparison = compareRecordsByOrderBy({
    recordA: record,
    recordB: lastLoadedRecord,
    orderBy,
  });

  return isDefined(comparison) && comparison > 0 ? 'refresh-count' : 'reset';
};
