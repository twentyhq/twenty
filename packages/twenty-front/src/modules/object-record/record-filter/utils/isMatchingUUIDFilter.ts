import {
  type UUIDFilter,
  type UUIDFilterValue,
} from '@/object-record/graphql/types/RecordGqlOperationFilter';

export const isMatchingUUIDFilter = ({
  uuidFilter,
  value,
}: {
  uuidFilter: UUIDFilter;
  value: UUIDFilterValue;
}) => {
  switch (true) {
    case uuidFilter.eq !== undefined: {
      return value === uuidFilter.eq;
    }
    case uuidFilter.neq !== undefined: {
      return value !== uuidFilter.neq;
    }
    case uuidFilter.in !== undefined: {
      return uuidFilter.in.includes(value);
    }
    case uuidFilter.is !== undefined: {
      if (uuidFilter.is === 'NULL') {
        return value === null;
      } else {
        return value !== null;
      }
    }
    default: {
      throw new Error(
        `Unexpected value for string filter : ${JSON.stringify(uuidFilter)}`,
      );
    }
  }
};
