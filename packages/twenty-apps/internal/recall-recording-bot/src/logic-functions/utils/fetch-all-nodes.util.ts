type ConnectionPage<TNode> = {
  pageInfo?: {
    hasNextPage?: boolean | null;
    endCursor?: string | null;
  } | null;
  edges?: Array<{ node: TNode }> | null;
};

export const fetchAllNodes = async <TNode>(
  fetchPage: (
    afterCursor: string | undefined,
  ) => Promise<ConnectionPage<TNode> | undefined>,
): Promise<TNode[]> => {
  const nodes: TNode[] = [];
  let hasNextPage = true;
  let afterCursor: string | undefined;

  while (hasNextPage) {
    const connection = await fetchPage(afterCursor);

    for (const edge of connection?.edges ?? []) {
      nodes.push(edge.node);
    }

    hasNextPage = connection?.pageInfo?.hasNextPage ?? false;
    afterCursor = connection?.pageInfo?.endCursor ?? undefined;

    if (afterCursor === undefined) {
      hasNextPage = false;
    }
  }

  return nodes;
};
