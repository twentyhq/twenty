import { QUERY_MAX_RECORDS } from 'twenty-shared/constants';

export const getFindManyPageSize = ({
  first,
  last,
}: {
  first?: number | null;
  last?: number | null;
}): number => Math.min(first ?? last ?? QUERY_MAX_RECORDS, QUERY_MAX_RECORDS);
