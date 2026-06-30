export type PageInfo = {
  hasNextPage: boolean;
  endCursor: string | null;
};

export type Connection<TNode> = {
  edges: Array<{ node: TNode }>;
  pageInfo?: PageInfo;
};

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

export const extractConnection = <TNode>(
  result: unknown,
  field: string,
): Connection<TNode> => {
  if (!isObject(result)) {
    return { edges: [] };
  }

  const candidate = result[field];

  if (!isObject(candidate)) {
    return { edges: [] };
  }

  return {
    edges: Array.isArray((candidate as Connection<TNode>).edges)
      ? (candidate as Connection<TNode>).edges
      : [],
    pageInfo: (candidate as Connection<TNode>).pageInfo,
  };
};

export const extractMutationRecord = <T = { id: string }>(
  result: unknown,
  field: string,
): T | undefined => {
  if (!isObject(result)) return undefined;

  const candidate = result[field];

  if (!isObject(candidate)) return undefined;

  return candidate as T;
};
