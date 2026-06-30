import { DEFAULT_NUMBER_OF_GROUPS_LIMIT } from 'twenty-shared/constants';

export const getGroupLimit = (limit?: number): number => {
  if (
    typeof limit === 'number' &&
    Number.isFinite(limit) &&
    limit > 0 &&
    Number.isInteger(limit)
  ) {
    return limit;
  }

  return DEFAULT_NUMBER_OF_GROUPS_LIMIT;
};
