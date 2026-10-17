import { isNonEmptyString } from '@sniptt/guards';
import {
  type ObjectRecord,
  type OrderBy,
  type RecordGqlOperationOrderBy,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { doNotTranslate } from 'twenty-shared/i18n';

import { sortAsc, sortDesc, sortNullsFirst, sortNullsLast } from '~/utils/sort';

type SortableValue = string | number | null;

// Same shape sortCachedObjectEdges walks: field, field.subField or
// relation.compositeField.subField, ending on the direction string.
const getOrderByPathAndDirection = (
  orderBy: RecordGqlOperationOrderBy,
): { path: string[]; direction: OrderBy } | null => {
  const firstOrderBy = orderBy[0];

  if (!isDefined(firstOrderBy)) {
    return null;
  }

  const path: string[] = [];
  let current: unknown = firstOrderBy;

  while (typeof current === 'object' && current !== null) {
    const entries = Object.entries(current);

    if (entries.length === 0) {
      return null;
    }

    const [key, value] = entries[0];

    path.push(key);
    current = value;
  }

  return isNonEmptyString(current)
    ? { path, direction: current as OrderBy }
    : null;
};

const readSortableValue = (
  record: ObjectRecord,
  path: string[],
): SortableValue | undefined => {
  let current: unknown = record;

  for (const key of path) {
    if (current === null || current === undefined) {
      return null;
    }

    if (typeof current !== 'object') {
      return undefined;
    }

    current = (current as Record<string, unknown>)[key];
  }

  if (current === null || current === undefined) {
    return null;
  }

  return typeof current === 'string' || typeof current === 'number'
    ? current
    : undefined;
};

// Compares two records on the first orderBy entry only, like the cached
// sorter does. Returns null when the records cannot be ordered from their
// own values: missing or non-scalar sort values, or mixed value types.
// A 0 means the first key ties and the server's tiebreakers decide.
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

  const valueA = readSortableValue(recordA, path);
  const valueB = readSortableValue(recordB, path);

  if (valueA === undefined || valueB === undefined) {
    return null;
  }

  if (valueA === null || valueB === null) {
    return direction.endsWith('NullsFirst')
      ? sortNullsFirst(valueA, valueB)
      : sortNullsLast(valueA, valueB);
  }

  if (typeof valueA !== typeof valueB) {
    return null;
  }

  return direction.startsWith(doNotTranslate('Asc'))
    ? sortAsc(valueA, valueB)
    : sortDesc(valueA, valueB);
};
