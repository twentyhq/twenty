import { BooleanFilter } from '@/object-record/record-filter/types/ObjectRecordFilter';

export const isMatchingBooleanFilter = ({
  booleanFilter,
  value,
}: {
  booleanFilter: BooleanFilter;
  value: boolean;
}) => {
  switch (true) {
    case booleanFilter.eq !== undefined: {
      return value === booleanFilter.eq;
    }
    case booleanFilter.is !== undefined: {
      if (booleanFilter.is === 'NULL') {
        return value === null;
      } else {
        return value !== null;
      }
    }
    default: {
      throw new Error(
        `Unexpected value for string filter : ${JSON.stringify(booleanFilter)}`,
      );
    }
  }
};
