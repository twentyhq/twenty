import {
  type ObjectRecord,
  type RecordGqlOperationOrderBy,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { type RecordTableVirtualizationEffect } from '@/object-record/record-table/virtualization/types/RecordTableVirtualizationEffect';
import { compareRecordsByOrderBy } from '@/object-record/utils/compareRecordsByOrderBy';

export const getRecordTableVirtualizationEffectForRecordOutsideWindow = ({
  record,
  lastLoadedRecord,
  lastLoadedRealIndex,
  totalNumberOfRecordsToVirtualize,
  isLoadingPages,
  orderBy,
}: {
  record: ObjectRecord;
  lastLoadedRecord: ObjectRecord | null | undefined;
  lastLoadedRealIndex: number | null;
  totalNumberOfRecordsToVirtualize: number | null;
  isLoadingPages: boolean;
  orderBy: RecordGqlOperationOrderBy;
}): RecordTableVirtualizationEffect => {
  if (
    isLoadingPages ||
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
