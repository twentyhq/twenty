import { type BooleanFilter } from 'twenty-shared/types';

export const isMatchingBooleanFilter = ({
  booleanFilter,
  value,
}: {
  booleanFilter: BooleanFilter;
  value: boolean;
}) => {
  if (booleanFilter.eq !== undefined) {
    return value === booleanFilter.eq;
  } else if (booleanFilter.is !== undefined) {
    if (booleanFilter.is === 'NULL') {
      return value === null;
    } else {
      return value !== null;
    }
  } else {
    throw new Error(
      `Unexpected value for string filter : ${JSON.stringify(booleanFilter)}`,
    );
  }
};
