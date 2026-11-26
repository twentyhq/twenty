import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-sdk/utils';

type ConnectionPage<TNode> =
  | {
      edges?: ({ node?: TNode | null } | null)[] | null;
      pageInfo?: {
        hasNextPage?: boolean | null;
        endCursor?: string | null;
      } | null;
    }
  | null
  | undefined;

export const collectConnectionNodesOrThrow = async <TNode>({
  fetchPage,
  after,
}: {
  fetchPage: (after: string | undefined) => Promise<ConnectionPage<TNode>>;
  after?: string;
}): Promise<TNode[]> => {
  const connection = await fetchPage(after);
  const nodes = (connection?.edges ?? [])
    .map((edge) => edge?.node)
    .filter(isDefined);

  if (!connection?.pageInfo?.hasNextPage) {
    return nodes;
  }

  const { endCursor } = connection.pageInfo;

  if (!isNonEmptyString(endCursor)) {
    throw new Error('A page announced a next page without a cursor');
  }

  return [
    ...nodes,
    ...(await collectConnectionNodesOrThrow({ fetchPage, after: endCursor })),
  ];
};
