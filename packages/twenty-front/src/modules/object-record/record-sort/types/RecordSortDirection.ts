export const RECORD_SORT_DIRECTIONS = ['asc', 'desc'] as const;

export type RecordSortDirection = (typeof RECORD_SORT_DIRECTIONS)[number];
