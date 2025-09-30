import { type ArrayFilter } from 'twenty-shared/types';

export const isMatchingArrayFilter = ({
  arrayFilter,
  value,
}: {
  arrayFilter: ArrayFilter;
  value: string[] | null;
}) => {
  switch (true) {
    case arrayFilter.is !== undefined: {
      if (arrayFilter.is === 'NULL') {
        return value === null;
      } else {
        return value !== null;
      }
    }
    case arrayFilter.isEmptyArray !== undefined: {
      return Array.isArray(value) && value.length === 0;
    }
    case arrayFilter.containsIlike !== undefined: {
      const searchTerm = arrayFilter.containsIlike.toLowerCase();
      return (
        Array.isArray(value) &&
        value.some((item) => item.toLowerCase().includes(searchTerm))
      );
    }
    default: {
      throw new Error(
        `Unexpected value for array filter: ${JSON.stringify(arrayFilter)}`,
      );
    }
  }
};
