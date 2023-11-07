export type PaginatedObjectTypeResults<ObjectType extends { id: string }> = {
  edges: {
    node: ObjectType;
    cursor: string;
  }[];
  pageInfo: {
    hasNextPage: boolean;
    startCursor: string;
    endCursor: string;
  };
};
