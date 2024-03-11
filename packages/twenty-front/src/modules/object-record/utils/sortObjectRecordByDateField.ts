import { DateTime } from 'luxon';

import { OrderBy } from '@/object-metadata/types/OrderBy';
import { ObjectRecord } from '@/object-record/types/ObjectRecord';
import { isDefined } from '~/utils/isDefined';

const SORT_BEFORE = -1;
const SORT_AFTER = 1;
const SORT_EQUAL = 0;

export const sortObjectRecordByDateField =
  <T extends ObjectRecord>(dateField: keyof T, sortDirection: OrderBy) =>
  (a: T, b: T) => {
    const aDate = a[dateField];
    const bDate = b[dateField];

    if (!isDefined(aDate) && !isDefined(bDate)) {
      return SORT_EQUAL;
    }

    if (!isDefined(aDate)) {
      if (sortDirection === 'AscNullsFirst') {
        return SORT_BEFORE;
      } else if (sortDirection === 'DescNullsFirst') {
        return SORT_BEFORE;
      } else if (sortDirection === 'AscNullsLast') {
        return SORT_AFTER;
      } else if (sortDirection === 'DescNullsLast') {
        return SORT_AFTER;
      }

      throw new Error(`Invalid sortDirection: ${sortDirection}`);
    }

    if (!isDefined(bDate)) {
      if (sortDirection === 'AscNullsFirst') {
        return SORT_AFTER;
      } else if (sortDirection === 'DescNullsFirst') {
        return SORT_AFTER;
      } else if (sortDirection === 'AscNullsLast') {
        return SORT_BEFORE;
      } else if (sortDirection === 'DescNullsLast') {
        return SORT_BEFORE;
      }

      throw new Error(`Invalid sortDirection: ${sortDirection}`);
    }

    const differenceInMs = DateTime.fromISO(aDate)
      .diff(DateTime.fromISO(bDate))
      .as('milliseconds');

    if (differenceInMs === 0) {
      return SORT_EQUAL;
    } else if (
      sortDirection === 'AscNullsFirst' ||
      sortDirection === 'AscNullsLast'
    ) {
      return differenceInMs > 0 ? SORT_AFTER : SORT_BEFORE;
    } else if (
      sortDirection === 'DescNullsFirst' ||
      sortDirection === 'DescNullsLast'
    ) {
      return differenceInMs > 0 ? SORT_BEFORE : SORT_AFTER;
    }

    throw new Error(`Invalid sortDirection: ${sortDirection}`);
  };
