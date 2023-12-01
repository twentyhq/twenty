export type PaginatedRecordTypeEdge<RecordType extends { id: string }> = {
  node: RecordType;
  cursor: string;
};

export type PaginatedRecordTypeResults<RecordType extends { id: string }> = {
  __typename?: string;
  edges: PaginatedRecordTypeEdge<RecordType>[];
  pageInfo: {
    hasNextPage: boolean;
    startCursor: string;
    endCursor: string;
  };
};
