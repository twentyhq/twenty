import { defineLogicFunction } from 'twenty-sdk/define';
import { type RoutePayload } from 'twenty-sdk/logic-function';
import { getClient } from 'src/modules/shared/twenty-client';
import { timed } from 'src/modules/shared/timing';
import { batchUpsertConsolidatedReviews } from 'src/modules/github/pull-request-review/graphql/mutations/batch-upsert';
import {
  buildConsolidatedRow,
  type ConsolidatedReviewUpsertInput,
} from 'src/modules/github/pull-request-review/utils/build-consolidated-row';
import type { ReviewEventState } from 'src/modules/github/pull-request-review/utils/consolidate-reviews';

const PAGE_SIZE = 100;

type Edge<T> = { node: T };
type Connection<T> = {
  edges: Edge<T>[];
  pageInfo: { hasNextPage: boolean; endCursor: string | null };
};

type ReviewEventNode = {
  state: ReviewEventState;
  submittedAt: string | null;
  reviewerId: string | null;
  pullRequestId: string | null;
  reviewer: { ghLogin: string | null } | null;
  pullRequest: {
    githubNumber: number | null;
    authorId: string | null;
  } | null;
};

type GroupContext = {
  pullRequestId: string;
  reviewerId: string | null;
  prNumber: number | null;
  reviewerLogin: string | null;
  prAuthorId: string | null;
  events: { state: ReviewEventState; submittedAt: string | null }[];
};

async function* paginate<T>(
  fetchPage: (cursor: string | null) => Promise<Connection<T>>,
): AsyncGenerator<T[]> {
  let cursor: string | null = null;
  let hasMore = true;
  while (hasMore) {
    const conn = await fetchPage(cursor);
    yield conn.edges.map((e) => e.node);
    hasMore = conn.pageInfo.hasNextPage;
    cursor = conn.pageInfo.endCursor;
    if (!cursor) break;
  }
}

const handler = async (_event: RoutePayload<unknown>) => {
  const handlerStart = Date.now();
  const client = getClient();

  const groups = new Map<string, GroupContext>();
  let eventCount = 0;
  let skippedNoPr = 0;

  await timed('recompute-reviews:scan-events', async () => {
    for await (const batch of paginate<ReviewEventNode>(async (cursor) => {
      const res = await client.query({
        pullRequestReviewEvents: {
          __args: { first: PAGE_SIZE, after: cursor },
          edges: {
            node: {
              state: true,
              submittedAt: true,
              reviewerId: true,
              pullRequestId: true,
              reviewer: { ghLogin: true },
              pullRequest: { githubNumber: true, authorId: true },
            },
          },
          pageInfo: { hasNextPage: true, endCursor: true },
        },
      });
      return (
        (res.pullRequestReviewEvents as Connection<ReviewEventNode>) ?? {
          edges: [],
          pageInfo: { hasNextPage: false, endCursor: null },
        }
      );
    })) {
      for (const node of batch) {
        eventCount++;
        if (!node.pullRequestId) {
          skippedNoPr++;
          continue;
        }
        const key = `${node.pullRequestId}:${node.reviewerId ?? 'unknown'}`;
        let group = groups.get(key);
        if (!group) {
          group = {
            pullRequestId: node.pullRequestId,
            reviewerId: node.reviewerId,
            prNumber: node.pullRequest?.githubNumber ?? null,
            reviewerLogin: node.reviewer?.ghLogin ?? null,
            prAuthorId: node.pullRequest?.authorId ?? null,
            events: [],
          };
          groups.set(key, group);
        }
        if (!group.reviewerLogin && node.reviewer?.ghLogin) {
          group.reviewerLogin = node.reviewer.ghLogin;
        }
        if (group.prNumber === null && node.pullRequest?.githubNumber != null) {
          group.prNumber = node.pullRequest.githubNumber;
        }
        if (group.prAuthorId === null && node.pullRequest?.authorId) {
          group.prAuthorId = node.pullRequest.authorId;
        }
        group.events.push({
          state: node.state,
          submittedAt: node.submittedAt,
        });
      }
    }
  });

  const rows: ConsolidatedReviewUpsertInput[] = [];
  for (const group of groups.values()) {
    if (group.events.length === 0) continue;
    rows.push(
      buildConsolidatedRow({
        pullRequestId: group.pullRequestId,
        reviewerId: group.reviewerId,
        prNumber: group.prNumber,
        reviewerLogin: group.reviewerLogin,
        events: group.events,
        prAuthorId: group.prAuthorId,
      }),
    );
  }

  let upsertedCount = 0;
  if (rows.length > 0) {
    const recs = await timed(`recompute-reviews:upsert (${rows.length})`, () =>
      batchUpsertConsolidatedReviews(rows),
    );
    upsertedCount = recs.length;
  }

  const totalMs = Date.now() - handlerStart;
  console.log(
    `[recompute-reviews] done in ${totalMs}ms (events=${eventCount}, groups=${groups.size}, upserted=${upsertedCount}, skippedNoPr=${skippedNoPr})`,
  );

  return {
    eventCount,
    groupCount: groups.size,
    upsertedCount,
    skippedNoPr,
    durationMs: totalMs,
  };
};

export default defineLogicFunction({
  universalIdentifier: 'fd2cbfa6-89a2-40f4-9164-0f658525cf07',
  name: 'recompute-pull-request-reviews',
  description:
    'Backfill/repeat-safe: scans every PullRequestReviewEvent, groups by (pullRequestId, reviewerId), and upserts the consolidated PullRequestReview row using the "first substantive wins" rule.',
  timeoutSeconds: 300,
  handler,
  httpRouteTriggerSettings: {
    path: '/pull-request-reviews/recompute',
    httpMethod: 'POST',
    isAuthRequired: true,
  },
});
