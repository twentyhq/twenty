import { StringFilter } from '@/object-record/graphql/types/RecordGqlOperationFilter';

export const isMatchingStringFilter = ({
  stringFilter,
  value,
}: {
  stringFilter: StringFilter;
  value: string;
}) => {
  switch (true) {
    case stringFilter.eq !== undefined: {
      return value === stringFilter.eq;
    }
    case stringFilter.neq !== undefined: {
      return value !== stringFilter.neq;
    }
    case stringFilter.like !== undefined: {
      const regexPattern = stringFilter.like.replace(/%/g, '.*');
      const regexCaseSensitive = new RegExp(`^${regexPattern}$`);

      return regexCaseSensitive.test(value);
    }
    case stringFilter.ilike !== undefined: {
      const regexPattern = stringFilter.ilike.replace(/%/g, '.*');
      const regexCaseInsensitive = new RegExp(`^${regexPattern}$`, 'i');

      return regexCaseInsensitive.test(value);
    }
    case stringFilter.in !== undefined: {
      return stringFilter.in.includes(value);
    }
    case stringFilter.is !== undefined: {
      if (stringFilter.is === 'NULL') {
        return value === null;
      } else {
        return value !== null;
      }
    }
    case stringFilter.regex !== undefined: {
      const regexPattern = stringFilter.regex;
      const regexCaseSensitive = new RegExp(regexPattern);

      return regexCaseSensitive.test(value);
    }
    case stringFilter.iregex !== undefined: {
      const regexPattern = stringFilter.iregex;
      const regexCaseInsensitive = new RegExp(regexPattern, 'i');

      return regexCaseInsensitive.test(value);
    }
    case stringFilter.gt !== undefined: {
      return value > stringFilter.gt;
    }
    case stringFilter.gte !== undefined: {
      return value >= stringFilter.gte;
    }
    case stringFilter.lt !== undefined: {
      return value < stringFilter.lt;
    }
    case stringFilter.lte !== undefined: {
      return value <= stringFilter.lte;
    }
    case stringFilter.startsWith !== undefined: {
      return value.startsWith(stringFilter.startsWith);
    }
    default: {
      throw new Error(
        `Unexpected value for string filter : ${JSON.stringify(stringFilter)}`,
      );
    }
  }
};
