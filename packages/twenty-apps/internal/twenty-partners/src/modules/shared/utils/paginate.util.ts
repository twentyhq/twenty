type PageResult<TNode> = {
  edges?: ({ node?: TNode | null } | null)[] | null;
  pageInfo?: { hasNextPage?: boolean | null; endCursor?: string | null } | null;
} | null | undefined;

// Drain a cursor-paginated connection fully: accumulate every present node, advancing the
// cursor until hasNextPage is false. A single capped page would strand overflow rows.
export async function collectAll<TNode>(
  fetchPage: (after: string | undefined) => Promise<PageResult<TNode>>,
): Promise<TNode[]> {
  const nodes: TNode[] = [];
  let after: string | undefined;
  for (;;) {
    const page = await fetchPage(after);
    for (const edge of page?.edges ?? []) {
      if (edge?.node) nodes.push(edge.node);
    }
    if (!page?.pageInfo?.hasNextPage) break;
    after = page?.pageInfo?.endCursor ?? undefined;
  }
  return nodes;
}
