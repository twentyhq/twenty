export type ConnectionPage<TNode> = {
  pageInfo?: {
    hasNextPage?: boolean | null;
    endCursor?: string | null;
  } | null;
  edges?: Array<{ node: TNode }> | null;
};
