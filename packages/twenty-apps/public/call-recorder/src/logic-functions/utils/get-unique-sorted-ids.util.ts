import { isString } from '@sniptt/guards';

export const getUniqueSortedIds = (
  ids: Array<string | null | undefined>,
): string[] =>
  [...new Set(ids.filter(isString))].sort((firstId, secondId) =>
    firstId.localeCompare(secondId),
  );
