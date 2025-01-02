import { StringFilter } from '@/object-record/graphql/types/RecordGqlOperationFilter';
import escapeRegExp from 'lodash.escaperegexp';

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
      const escapedPattern = escapeRegExp(stringFilter.like);
      const regexPattern = escapedPattern.replace(/%/g, '.*');
      const regexCaseSensitive = new RegExp(`^${regexPattern}$`);

      return regexCaseSensitive.test(value);
    }
    case stringFilter.ilike !== undefined: {
      const escapedPattern = escapeRegExp(stringFilter.ilike);
      const regexPattern = escapedPattern.replace(/%/g, '.*');
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
