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

    if (connection === undefined) {
      throw new Error('Pagination query returned no connection');
    }

    for (const edge of connection.edges ?? []) {
      nodes.push(edge.node);
    }

    hasNextPage = connection.pageInfo?.hasNextPage === true;
    const endCursor = connection.pageInfo?.endCursor;

    if (hasNextPage && typeof endCursor !== 'string') {
      throw new Error(
        'Inconsistent pagination state: hasNextPage is true without an endCursor',
      );
    }

    afterCursor = typeof endCursor === 'string' ? endCursor : undefined;
  }

  return nodes;
};
