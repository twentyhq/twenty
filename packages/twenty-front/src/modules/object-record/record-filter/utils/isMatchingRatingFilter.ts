import { type RatingFilter } from 'twenty-shared/types';

export const isMatchingRatingFilter = ({
  ratingFilter,
  value,
}: {
  ratingFilter: RatingFilter;
  value: string | null;
}) => {
  switch (true) {
    case ratingFilter.eq !== undefined: {
      return value === ratingFilter.eq;
    }
    case ratingFilter.in !== undefined: {
      return value !== null && ratingFilter.in.includes(value);
    }
    case ratingFilter.is !== undefined: {
      if (ratingFilter.is === 'NULL') {
        return value === null;
      } else {
        return value !== null;
      }
    }
    default: {
      throw new Error(
        `Unexpected value for rating filter : ${JSON.stringify(ratingFilter)}`,
      );
    }
  }
};
