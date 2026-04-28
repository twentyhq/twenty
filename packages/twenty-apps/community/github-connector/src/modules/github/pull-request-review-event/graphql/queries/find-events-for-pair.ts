import { getClient } from 'src/modules/shared/twenty-client';

export type ReviewEventForPair = {
  id: string;
  state: string;
  submittedAt: string | null;
};

type Edge<T> = { node: T };
type Connection<T> = {
  edges: Edge<T>[];
  pageInfo: { hasNextPage: boolean; endCursor: string | null };
};

const PAGE_SIZE = 100;

export async function findReviewEventsForPair(
  pullRequestId: string,
  reviewerId: string | null,
): Promise<ReviewEventForPair[]> {
  const client = getClient();
  const out: ReviewEventForPair[] = [];
  let cursor: string | null = null;

  const reviewerFilter =
    reviewerId === null
      ? { reviewerId: { is: 'NULL' } }
      : { reviewerId: { eq: reviewerId } };

  for (;;) {
    const res = await client.query({
      pullRequestReviewEvents: {
        __args: {
          filter: {
            and: [{ pullRequestId: { eq: pullRequestId } }, reviewerFilter],
          },
          orderBy: [{ submittedAt: 'AscNullsLast' }],
          first: PAGE_SIZE,
          after: cursor,
        },
        edges: {
          node: { id: true, state: true, submittedAt: true },
        },
        pageInfo: { hasNextPage: true, endCursor: true },
      },
    });

    const conn =
      (res.pullRequestReviewEvents as Connection<ReviewEventForPair>) ?? {
        edges: [],
        pageInfo: { hasNextPage: false, endCursor: null },
      };

    for (const edge of conn.edges) out.push(edge.node);

    if (!conn.pageInfo.hasNextPage || !conn.pageInfo.endCursor) break;
    cursor = conn.pageInfo.endCursor;
  }

  return out;
}
