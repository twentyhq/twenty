import { isUndefined } from '@sniptt/guards';
import {
  type ObjectRecord,
  type RecordGqlOperationOrderBy,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { compareSortableValues } from '@/object-record/utils/compareSortableValues';
import { getOrderByPathAndDirection } from '@/object-record/utils/getOrderByPathAndDirection';
import { readRecordSortableValue } from '@/object-record/utils/readRecordSortableValue';

// null: the records cannot be ordered from their own values, so callers must not guess
export const compareRecordsByOrderBy = ({
  recordA,
  recordB,
  orderBy,
}: {
  recordA: ObjectRecord;
  recordB: ObjectRecord;
  orderBy: RecordGqlOperationOrderBy;
}): number | null => {
  const pathAndDirection = getOrderByPathAndDirection(orderBy);

  if (!isDefined(pathAndDirection)) {
    return null;
  }

  const { path, direction } = pathAndDirection;

  const valueA = readRecordSortableValue(recordA, path);
  const valueB = readRecordSortableValue(recordB, path);

  if (isUndefined(valueA) || isUndefined(valueB)) {
    return null;
  }

  if (
    isDefined(valueA) &&
    isDefined(valueB) &&
    typeof valueA !== typeof valueB
  ) {
    return null;
  }

  return compareSortableValues(valueA, valueB, direction);
};
