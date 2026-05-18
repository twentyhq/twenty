export type TwentyClientLike = {
  query: (query: Record<string, unknown>) => Promise<unknown>;
  mutation: (mutation: Record<string, unknown>) => Promise<unknown>;
};

export type TwentyConnection<TNode> = {
  edges: Array<{ node: TNode }>;
};
