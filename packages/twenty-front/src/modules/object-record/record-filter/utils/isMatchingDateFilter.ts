import { isAfter, isBefore, isEqual, parseISO } from 'date-fns';
import { type DateFilter } from 'twenty-shared/types';

export const isMatchingDateFilter = ({
  dateFilter,
  value,
}: {
  dateFilter: DateFilter;
  value: string;
}) => {
  switch (true) {
    case dateFilter.eq !== undefined: {
      return isEqual(parseISO(value), parseISO(dateFilter.eq));
    }
    case dateFilter.neq !== undefined: {
      return !isEqual(parseISO(value), parseISO(dateFilter.neq));
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
      return isAfter(parseISO(value), parseISO(dateFilter.gt));
    }
    case dateFilter.gte !== undefined: {
      const valueDate = parseISO(value);
      const filterDate = parseISO(dateFilter.gte);
      return isAfter(valueDate, filterDate) || isEqual(valueDate, filterDate);
    }
    case dateFilter.lt !== undefined: {
      return isBefore(parseISO(value), parseISO(dateFilter.lt));
    }
    case dateFilter.lte !== undefined: {
      const valueDate = parseISO(value);
      const filterDate = parseISO(dateFilter.lte);
      return isBefore(valueDate, filterDate) || isEqual(valueDate, filterDate);
    }
    default: {
      throw new Error(
        `Unexpected value for string filter : ${JSON.stringify(dateFilter)}`,
      );
    }
  }
};
