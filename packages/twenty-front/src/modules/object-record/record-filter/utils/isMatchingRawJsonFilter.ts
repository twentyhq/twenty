import { type RawJsonFilter } from 'twenty-shared/types';

export const isMatchingRawJsonFilter = ({
  rawJsonFilter,
  value,
}: {
  rawJsonFilter: RawJsonFilter;
  value: string;
}) => {
  switch (true) {
    case rawJsonFilter.like !== undefined: {
      const regexPattern = rawJsonFilter.like.replace(/%/g, '.*');
      const regexCaseInsensitive = new RegExp(`^${regexPattern}$`, 'is');

      const stringValue = JSON.stringify(value, null, 1);

      return regexCaseInsensitive.test(stringValue);
    }
    case rawJsonFilter.is !== undefined: {
      if (rawJsonFilter.is === 'NULL') {
        return value === null;
      } else {
        return value !== null;
      }
    }
    default: {
      throw new Error(
        `Unexpected value for string filter : ${JSON.stringify(rawJsonFilter)}`,
      );
    }
  }
};
