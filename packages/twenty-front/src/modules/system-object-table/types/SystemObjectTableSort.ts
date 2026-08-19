export type SystemObjectTableSortDirection = 'asc' | 'desc';

export type SystemObjectTableSort = {
  columnKey: string;
  direction: SystemObjectTableSortDirection;
};
