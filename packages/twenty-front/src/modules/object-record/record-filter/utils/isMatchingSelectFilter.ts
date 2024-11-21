import { SelectFilter } from '@/object-record/graphql/types/RecordGqlOperationFilter';

export const isMatchingSelectFilter = ({
  selectFilter,
  value,
}: {
  selectFilter: SelectFilter;
  value: string;
}) => {
  switch (true) {
    case selectFilter.in !== undefined: {
      return selectFilter.in.includes(value);
    }
    case selectFilter.is !== undefined: {
      if (selectFilter.is === 'NULL') {
        return value === null;
      } else {
        return value !== null;
      }
    }
    case selectFilter.eq !== undefined: {
      return value === selectFilter.eq;
    }
    default: {
      throw new Error(
        `Unexpected value for select filter : ${JSON.stringify(selectFilter)}`,
      );
    }
  }
};
