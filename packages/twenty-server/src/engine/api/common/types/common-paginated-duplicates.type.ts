import { type ObjectRecord } from 'twenty-shared/types';

export type CommonPaginatedDuplicates = {
  records: ObjectRecord[];
  totalCount: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  startCursor: string | null;
  endCursor: string | null;
};
