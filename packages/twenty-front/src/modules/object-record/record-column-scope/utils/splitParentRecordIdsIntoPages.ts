import { QUERY_MAX_RECORDS } from 'twenty-shared/constants';

// Fixed boundaries keep earlier pages' variables stable as rows load, so only the last page refetches
export const splitParentRecordIdsIntoPages = (
  parentRecordIds: string[],
): string[][] =>
  Array.from(
    { length: Math.ceil(parentRecordIds.length / QUERY_MAX_RECORDS) },
    (_, pageIndex) =>
      parentRecordIds.slice(
        pageIndex * QUERY_MAX_RECORDS,
        (pageIndex + 1) * QUERY_MAX_RECORDS,
      ),
  );
