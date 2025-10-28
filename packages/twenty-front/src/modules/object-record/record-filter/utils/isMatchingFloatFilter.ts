import { type FloatFilter } from 'twenty-shared/types';

export const isMatchingFloatFilter = ({
  floatFilter,
  value,
}: {
  floatFilter: FloatFilter;
  value: number;
}) => {
  switch (true) {
    case floatFilter.eq !== undefined: {
      return value === floatFilter.eq;
    }
    case floatFilter.neq !== undefined: {
      return value !== floatFilter.neq;
    }
    case floatFilter.gt !== undefined: {
      return value > floatFilter.gt;
    }
    case floatFilter.gte !== undefined: {
      return value >= floatFilter.gte;
    }
    case floatFilter.lt !== undefined: {
      return value < floatFilter.lt;
    }
    case floatFilter.lte !== undefined: {
      return value <= floatFilter.lte;
    }
    case floatFilter.in !== undefined: {
      return floatFilter.in.includes(value);
    }
    case floatFilter.is !== undefined: {
      if (floatFilter.is === 'NULL') {
        return value === null;
      } else {
        return value !== null;
      }
    }
    default: {
      throw new Error(
        `Unexpected value for float filter : ${JSON.stringify(floatFilter)}`,
      );
    }
  }
};
