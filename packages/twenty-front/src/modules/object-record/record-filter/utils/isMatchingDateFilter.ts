import { DateTime } from 'luxon';

import { DateFilter } from '@/object-record//graphql/types/RecordGqlOperationFilter';

export const isMatchingDateFilter = ({
  dateFilter,
  value,
}: {
  dateFilter: DateFilter;
  value: string;
}) => {
  switch (true) {
    case dateFilter.eq !== undefined: {
      return DateTime.fromISO(value).equals(DateTime.fromISO(dateFilter.eq));
    }
    case dateFilter.neq !== undefined: {
      return !DateTime.fromISO(value).equals(DateTime.fromISO(dateFilter.neq));
    }
    case dateFilter.in !== undefined: {
      return dateFilter.in.includes(value);
    }
    case dateFilter.is !== undefined: {
      if (dateFilter.is === 'NULL') {
        return value === null;
      } else {
        return value !== null;
      }
    }
    case dateFilter.gt !== undefined: {
      return DateTime.fromISO(value) > DateTime.fromISO(dateFilter.gt);
    }
    case dateFilter.gte !== undefined: {
      return DateTime.fromISO(value) >= DateTime.fromISO(dateFilter.gte);
    }
    case dateFilter.lt !== undefined: {
      return DateTime.fromISO(value) < DateTime.fromISO(dateFilter.lt);
    }
    case dateFilter.lte !== undefined: {
      return DateTime.fromISO(value) <= DateTime.fromISO(dateFilter.lte);
    }
    default: {
      throw new Error(
        `Unexpected value for string filter : ${JSON.stringify(dateFilter)}`,
      );
    }
  }
};
