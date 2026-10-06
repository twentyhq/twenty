export type DataRecord = Record<string, unknown>;

export type DataPageInfo = {
  hasNextPage: boolean;
  hasPreviousPage?: boolean;
  startCursor: string | null;
  endCursor: string | null;
};

export type DataPage = {
  records: DataRecord[];
  pageInfo: DataPageInfo;
  totalCount: number;
};
