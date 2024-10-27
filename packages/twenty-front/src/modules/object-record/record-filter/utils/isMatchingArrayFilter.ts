import { ArrayFilter } from '@/object-record/graphql/types/RecordGqlOperationFilter';

export const isMatchingArrayFilter = ({
  arrayFilter,
  value,
}: {
  arrayFilter: ArrayFilter;
  value: string[];
}) => {
  if (value === null || !Array.isArray(value)) {
    return false;
  }

  switch (true) {
    case arrayFilter.contains !== undefined: {
      return arrayFilter.contains.every((item) => value.includes(item));
    }
    case arrayFilter.not_contains !== undefined: {
      return !arrayFilter.not_contains.some((item) => value.includes(item));
    }
    case arrayFilter.is !== undefined: {
      if (arrayFilter.is === 'NULL') {
        return value === null;
      } else {
        return value !== null;
      }
    }
    default: {
      throw new Error(
        `Unexpected value for array filter: ${JSON.stringify(arrayFilter)}`,
      );
    }
  }
};
