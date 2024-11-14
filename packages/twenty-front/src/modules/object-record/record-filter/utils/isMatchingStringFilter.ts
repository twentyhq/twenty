import { StringFilter } from '@/object-record/graphql/types/RecordGqlOperationFilter';

export const isMatchingStringFilter = ({
  stringFilter,
  value,
}: {
  stringFilter: StringFilter;
  value: string | null;
}) => {
  const defaultedValue = value ?? '';

  switch (true) {
    case stringFilter.eq !== undefined: {
      return defaultedValue === stringFilter.eq;
    }
    case stringFilter.neq !== undefined: {
      return defaultedValue !== stringFilter.neq;
    }
    case stringFilter.like !== undefined: {
      const regexPattern = stringFilter.like.replace(/%/g, '.*');
      const regexCaseSensitive = new RegExp(`^${regexPattern}$`);

      return regexCaseSensitive.test(defaultedValue);
    }
    case stringFilter.ilike !== undefined: {
      const regexPattern = stringFilter.ilike.replace(/%/g, '.*');
      const regexCaseInsensitive = new RegExp(`^${regexPattern}$`, 'i');

      return regexCaseInsensitive.test(defaultedValue);
    }
    case stringFilter.in !== undefined: {
      return stringFilter.in.includes(defaultedValue);
    }
    case stringFilter.is !== undefined: {
      if (stringFilter.is === 'NULL') {
        return defaultedValue === null;
      } else {
        return defaultedValue !== null;
      }
    }
    case stringFilter.regex !== undefined: {
      const regexPattern = stringFilter.regex;
      const regexCaseSensitive = new RegExp(regexPattern);

      return regexCaseSensitive.test(defaultedValue);
    }
    case stringFilter.iregex !== undefined: {
      const regexPattern = stringFilter.iregex;
      const regexCaseInsensitive = new RegExp(regexPattern, 'i');

      return regexCaseInsensitive.test(defaultedValue);
    }
    case stringFilter.startsWith !== undefined: {
      return defaultedValue.startsWith(stringFilter.startsWith);
    }
    default: {
      throw new Error(
        `Unexpected value for string filter : ${JSON.stringify(stringFilter)}`,
      );
    }
  }
};
