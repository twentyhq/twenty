import { ArrayFilter } from '@/object-record/graphql/types/RecordGqlOperationFilter';

export const isMatchingArrayFilter = ({
  arrayFilter,
  value,
}: {
  arrayFilter: ArrayFilter;
  value: string[] | null;
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
    case arrayFilter.containsAny !== undefined: {
      return arrayFilter.containsAny.some((item) => value.includes(item));
    }
    case arrayFilter.containsIlike !== undefined: {
      const searchTerm = arrayFilter.containsIlike.toLowerCase();
      return value.some((item) => item.toLowerCase().includes(searchTerm));
    }
    default: {
      throw new Error(
        `Unexpected value for array filter: ${JSON.stringify(arrayFilter)}`,
      );
    }
  }
};
