export type PaginatedRecordTypeEdge<
  RecordType extends { id: string } & Record<string, any>,
> = {
  node: RecordType;
  cursor: string;
  __typename?: string;
};

export type PaginatedRecordTypeResults<
  RecordType extends { id: string } & Record<string, any>,
> = {
  __typename?: string;
  edges: PaginatedRecordTypeEdge<RecordType>[];
  pageInfo: {
    hasNextPage: boolean;
    startCursor: string;
    endCursor: string;
  };
};
