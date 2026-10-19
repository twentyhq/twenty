import { isUndefined } from '@sniptt/guards';
import {
  type ObjectRecord,
  type RecordGqlOperationOrderBy,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { compareSortableValues } from '@/object-record/utils/compareSortableValues';
import { getOrderByPathAndDirection } from '@/object-record/utils/getOrderByPathAndDirection';
import { readRecordSortableValue } from '@/object-record/utils/readRecordSortableValue';

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

  const valueA = readRecordSortableValue({ record: recordA, path });
  const valueB = readRecordSortableValue({ record: recordB, path });

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

  return compareSortableValues({ valueA, valueB, direction });
};
