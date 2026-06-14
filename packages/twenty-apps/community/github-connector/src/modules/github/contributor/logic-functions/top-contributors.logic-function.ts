import { defineLogicFunction } from 'twenty-sdk/define';
import { type RoutePayload } from 'twenty-sdk/logic-function';
import { isBotLogin } from 'src/modules/github/contributor/utils/is-bot-login';
import { getClient } from 'src/modules/shared/twenty-client';

type ContributorRef = {
  id: string;
  name: string | null;
  ghLogin: string | null;
  avatarUrl: string | null;
};

type LeaderboardEntry = ContributorRef & {
  count: number;
};

type TopContributorsKind = 'authors' | 'reviewers' | 'both';

type TopContributorsPayload = {
  days?: number;
  limit?: number;
  kind?: TopContributorsKind;
};

type TopContributorsResponse = {
  days: number;
  limit: number;
  topAuthors: LeaderboardEntry[];
  topReviewers: LeaderboardEntry[];
  truncated: { authors: boolean; reviewers: boolean };
};

const PAGE_SIZE = 100;
const MAX_PAGES = 50;
const DEFAULT_DAYS = 90;
const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 50;
const MAX_DAYS = 365;

type Edge<T> = { node: T };
type Connection<T> = {
  edges: Edge<T>[];
  pageInfo: { hasNextPage: boolean; endCursor: string | null };
};

async function paginateUntil<T>(
  fetchPage: (cursor: string | null) => Promise<Connection<T>>,
  isOlderThanRange: (item: T) => boolean,
): Promise<{ items: T[]; truncated: boolean }> {
  const items: T[] = [];
  let cursor: string | null = null;
  for (let page = 0; page < MAX_PAGES; page++) {
    const conn = await fetchPage(cursor);
    let stop = false;
    for (const edge of conn.edges) {
      if (isOlderThanRange(edge.node)) {
        stop = true;
        break;
      }
      items.push(edge.node);
    }
    if (stop) return { items, truncated: false };
    if (!conn.pageInfo.hasNextPage || !conn.pageInfo.endCursor) {
      return { items, truncated: false };
    }
    cursor = conn.pageInfo.endCursor;
  }
  return { items, truncated: true };
}

type AuthorInfo = {
  id: string;
  name: string | null;
  ghLogin: string | null;
  avatarUrl: { primaryLinkUrl: string | null } | null;
};

type PrNode = {
  githubCreatedAt: string | null;
  author: AuthorInfo | null;
};

type ReviewNode = {
  firstSubmittedAt: string | null;
  reviewer: AuthorInfo | null;
};

const tally = (
  items: { contributor: AuthorInfo | null }[],
  limit: number,
): LeaderboardEntry[] => {
  const counts = new Map<string, LeaderboardEntry>();
  for (const item of items) {
    const c = item.contributor;
    if (!c) continue;
    if (isBotLogin(c.ghLogin)) continue;
    const existing = counts.get(c.id);
    if (existing) {
      existing.count += 1;
    } else {
      counts.set(c.id, {
        id: c.id,
        name: c.name ?? null,
        ghLogin: c.ghLogin ?? null,
        avatarUrl: c.avatarUrl?.primaryLinkUrl ?? null,
        count: 1,
      });
    }
  }
  return Array.from(counts.values())
    .sort(
      (a, b) =>
        b.count - a.count || (a.ghLogin ?? '').localeCompare(b.ghLogin ?? ''),
    )
    .slice(0, limit);
};

const handler = async (
  event: RoutePayload<TopContributorsPayload>,
): Promise<TopContributorsResponse> => {
  const daysInput = event.body?.days;
  const limitInput = event.body?.limit;

  const days = Math.min(
    Math.max(
      Math.floor(
        typeof daysInput === 'number' && Number.isFinite(daysInput)
          ? daysInput
          : DEFAULT_DAYS,
      ),
      1,
    ),
    MAX_DAYS,
  );
  const limit = Math.min(
    Math.max(
      Math.floor(
        typeof limitInput === 'number' && Number.isFinite(limitInput)
          ? limitInput
          : DEFAULT_LIMIT,
      ),
      1,
    ),
    MAX_LIMIT,
  );

  const kindInput = event.body?.kind;
  const kind: TopContributorsKind =
    kindInput === 'authors' || kindInput === 'reviewers' ? kindInput : 'both';

  const sinceMs = Date.now() - days * 24 * 3600 * 1000;
  const client = getClient();

  const authoredResult: { items: PrNode[]; truncated: boolean } =
    kind === 'reviewers'
      ? { items: [], truncated: false }
      : await paginateUntil<PrNode>(
          async (cursor) => {
            const res = await client.query({
              pullRequests: {
                __args: {
                  orderBy: [{ githubCreatedAt: 'DescNullsLast' }],
                  first: PAGE_SIZE,
                  after: cursor,
                },
                edges: {
                  node: {
                    githubCreatedAt: true,
                    author: {
                      id: true,
                      name: true,
                      ghLogin: true,
                      avatarUrl: { primaryLinkUrl: true },
                    },
                  },
                },
                pageInfo: { hasNextPage: true, endCursor: true },
              },
            });
            return (
              (res.pullRequests as Connection<PrNode>) ?? {
                edges: [],
                pageInfo: { hasNextPage: false, endCursor: null },
              }
            );
          },
          (n) => {
            if (!n.githubCreatedAt) return false;
            return new Date(n.githubCreatedAt).getTime() < sinceMs;
          },
        );

  const reviewedResult: { items: ReviewNode[]; truncated: boolean } =
    kind === 'authors'
      ? { items: [], truncated: false }
      : await paginateUntil<ReviewNode>(
          async (cursor) => {
            const res = await client.query({
              pullRequestReviews: {
                __args: {
                  filter: { isSelfReview: { eq: false } },
                  orderBy: [{ firstSubmittedAt: 'DescNullsLast' }],
                  first: PAGE_SIZE,
                  after: cursor,
                },
                edges: {
                  node: {
                    firstSubmittedAt: true,
                    reviewer: {
                      id: true,
                      name: true,
                      ghLogin: true,
                      avatarUrl: { primaryLinkUrl: true },
                    },
                  },
                },
                pageInfo: { hasNextPage: true, endCursor: true },
              },
            });
            return (
              (res.pullRequestReviews as Connection<ReviewNode>) ?? {
                edges: [],
                pageInfo: { hasNextPage: false, endCursor: null },
              }
            );
          },
          (n) => {
            if (!n.firstSubmittedAt) return false;
            return new Date(n.firstSubmittedAt).getTime() < sinceMs;
          },
        );

  const topAuthors = tally(
    authoredResult.items.map((pr) => ({ contributor: pr.author })),
    limit,
  );
  const topReviewers = tally(
    reviewedResult.items.map((r) => ({ contributor: r.reviewer })),
    limit,
  );

  return {
    days,
    limit,
    topAuthors,
    topReviewers,
    truncated: {
      authors: authoredResult.truncated,
      reviewers: reviewedResult.truncated,
    },
  };
};

export default defineLogicFunction({
  universalIdentifier: 'd5b9c4a2-7e3f-4a1b-9c8d-2f4e6a7b8c9d',
  name: 'top-contributors',
  description:
    'Returns the top contributors by pull-request authorship and review counts over a configurable time window.',
  timeoutSeconds: 30,
  handler,
  httpRouteTriggerSettings: {
    path: '/contributors/top',
    httpMethod: 'POST',
    isAuthRequired: true,
  },
});
