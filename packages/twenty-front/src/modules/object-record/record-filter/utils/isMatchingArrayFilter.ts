import { ArrayFilter } from '@/object-record/graphql/types/RecordGqlOperationFilter';

export const isMatchingArrayFilter = ({
  arrayFilter,
  value,
}: {
  arrayFilter: ArrayFilter;
  value: string;
}) => {
  switch (true) {
    case arrayFilter.contains !== undefined: {
      return arrayFilter.contains.every((item) => value.includes(item));
    }
    case arrayFilter.not_contains !== undefined: {
      return !arrayFilter.not_contains.every((item) => value.includes(item));
    }

    default: {
      throw new Error(
        `Unexpected value for array filter: ${JSON.stringify(arrayFilter)}`,
      );
    }
  }
};
