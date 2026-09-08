import { isString, isUndefined } from '@sniptt/guards';

const MAX_PAGINATION_PAGES = 20;

export type ConnectionPage<TNode> = {
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
  shouldStartPageRequest: () => boolean = () => true,
): Promise<TNode[]> => {
  const nodes: TNode[] = [];
  const cursors = new Set<string>();
  let pages = 0;
  let hasNextPage = true;
  let afterCursor: string | undefined;

  while (hasNextPage && shouldStartPageRequest()) {
    if (++pages > MAX_PAGINATION_PAGES)
      throw new Error('Pagination exceeded 20 pages; narrow the query.');
    const connection = await fetchPage(afterCursor);

    if (isUndefined(connection)) {
      throw new Error('Pagination query returned no connection');
    }

    for (const edge of connection.edges ?? []) {
      nodes.push(edge.node);
    }

    hasNextPage = connection.pageInfo?.hasNextPage === true;
    const endCursor = connection.pageInfo?.endCursor;

    if (hasNextPage && !isString(endCursor)) {
      throw new Error(
        'Inconsistent pagination state: hasNextPage is true without an endCursor',
      );
    }

    if (hasNextPage && isString(endCursor)) {
      if (!endCursor || cursors.has(endCursor))
        throw new Error('Pagination cursor did not advance');
      cursors.add(endCursor);
    }
    afterCursor = isString(endCursor) ? endCursor : undefined;
  }

  return nodes;
};
