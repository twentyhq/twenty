import { defineLogicFunction, type RoutePayload } from 'twenty-sdk/define';
import { getClient } from 'src/modules/shared/twenty-client';
import { isIgnoredGithubHandle } from 'src/modules/github/contributor/constants/ignored-contributors';
import { isAlumniGithubHandle } from 'src/modules/github/contributor/constants/alumni-contributors';

type Payload = Record<string, never>;

type EngineerInfo = {
  id: string;
  name: string | null;
  ghLogin: string | null;
  avatarUrl: string | null;
};

type LeaderRow = EngineerInfo & { count: number };

type MonthBucket = {
  month: string;
  externalPrsMerged: number;
  externalIssuesOpened: number;
};

type Response = {
  rangeStart: string;
  rangeEnd: string;
  monthsBack: number;
  kpis: {
    externalContributorsLifetime: number;
    activeExternalContributorsThisMonth: number;
    externalPrsMergedThisMonth: number;
    externalIssuesOpenedThisMonth: number;
  };
  byMonth: MonthBucket[];
  topMerged: LeaderRow[];
  topReviewed: LeaderRow[];
  truncated: { prs: boolean; issues: boolean; reviews: boolean };
};

const PAGE_SIZE = 100;
const MAX_PAGES = 80;
const MONTHS_BACK = 24;
const TOP_N = 10;
const ENGINEER_BATCH = 100;

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

const startOfUtcMonth = (d: Date): Date =>
  new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1));

const monthKey = (d: Date): string =>
  `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`;

type MergedPrNode = { mergedAt: string | null; authorId: string | null };
type IssueNode = {
  githubCreatedAt: string | null;
  authorId: string | null;
};
type ReviewNode = {
  firstSubmittedAt: string | null;
  reviewerId: string | null;
};
type EngineerNode = {
  id: string;
  name: string | null;
  ghLogin: string | null;
  isCoreTeam: boolean | null;
  avatarUrl: { primaryLinkUrl: string | null } | null;
};

const handler = async (
  _event: RoutePayload<Payload>,
): Promise<Response> => {
  const now = new Date();
  const monthStart = startOfUtcMonth(now);
  const monthStartMs = monthStart.getTime();

  // Range covers the chart window (last MONTHS_BACK calendar months, including current).
  const rangeStart = new Date(
    Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth() - (MONTHS_BACK - 1),
      1,
    ),
  );
  const rangeStartMs = rangeStart.getTime();

  const client = getClient();

  const mergedResult = await paginateUntil<MergedPrNode>(
    async (cursor) => {
      const res = await client.query({
        pullRequests: {
          __args: {
            filter: { state: { eq: 'MERGED' } },
            orderBy: [{ mergedAt: 'DescNullsLast' }],
            first: PAGE_SIZE,
            after: cursor,
          },
          edges: { node: { mergedAt: true, authorId: true } },
          pageInfo: { hasNextPage: true, endCursor: true },
        },
      });
      return (
        (res.pullRequests as Connection<MergedPrNode>) ?? {
          edges: [],
          pageInfo: { hasNextPage: false, endCursor: null },
        }
      );
    },
    (n) => {
      if (!n.mergedAt) return false;
      return new Date(n.mergedAt).getTime() < rangeStartMs;
    },
  );

  const issuesResult = await paginateUntil<IssueNode>(
    async (cursor) => {
      const res = await client.query({
        issues: {
          __args: {
            orderBy: [{ githubCreatedAt: 'DescNullsLast' }],
            first: PAGE_SIZE,
            after: cursor,
          },
          edges: { node: { githubCreatedAt: true, authorId: true } },
          pageInfo: { hasNextPage: true, endCursor: true },
        },
      });
      return (
        (res.issues as Connection<IssueNode>) ?? {
          edges: [],
          pageInfo: { hasNextPage: false, endCursor: null },
        }
      );
    },
    (n) => {
      if (!n.githubCreatedAt) return false;
      return new Date(n.githubCreatedAt).getTime() < rangeStartMs;
    },
  );

  const reviewsResult = await paginateUntil<ReviewNode>(
    async (cursor) => {
      const res = await client.query({
        pullRequestReviews: {
          __args: {
            orderBy: [{ firstSubmittedAt: 'DescNullsLast' }],
            first: PAGE_SIZE,
            after: cursor,
          },
          edges: { node: { firstSubmittedAt: true, reviewerId: true } },
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
      return new Date(n.firstSubmittedAt).getTime() < rangeStartMs;
    },
  );

  // Collect all engineer ids referenced anywhere, then look them up in batches
  // to find which are external + non-bot.
  const allEngineerIds = new Set<string>();
  for (const pr of mergedResult.items) {
    if (pr.authorId) allEngineerIds.add(pr.authorId);
  }
  for (const issue of issuesResult.items) {
    if (issue.authorId) allEngineerIds.add(issue.authorId);
  }
  for (const r of reviewsResult.items) {
    if (r.reviewerId) allEngineerIds.add(r.reviewerId);
  }

  const externalEngineers = new Map<string, EngineerInfo>();
  const ids = Array.from(allEngineerIds);
  for (let i = 0; i < ids.length; i += ENGINEER_BATCH) {
    const batch = ids.slice(i, i + ENGINEER_BATCH);
    const res = await client.query({
      engineers: {
        __args: { filter: { id: { in: batch } }, first: batch.length },
        edges: {
          node: {
            id: true,
            name: true,
            ghLogin: true,
            isCoreTeam: true,
            avatarUrl: { primaryLinkUrl: true },
          },
        },
      },
    });
    const edges =
      (res.engineers as { edges?: { node: EngineerNode }[] } | undefined)
        ?.edges ?? [];
    for (const e of edges) {
      const n = e.node;
      if (n.isCoreTeam) continue;
      if (isIgnoredGithubHandle(n.ghLogin)) continue;
      if (isAlumniGithubHandle(n.ghLogin)) continue;
      externalEngineers.set(n.id, {
        id: n.id,
        name: n.name ?? null,
        ghLogin: n.ghLogin ?? null,
        avatarUrl: n.avatarUrl?.primaryLinkUrl ?? null,
      });
    }
  }

  // Lifetime "Total External Contributors": distinct external engineers (bots
  // excluded) — counted from the full engineer table, regardless of activity
  // window. Cheap separate query.
  let externalContributorsLifetime = 0;
  {
    let cursor: string | null = null;
    for (let page = 0; page < MAX_PAGES; page++) {
      const res = await client.query({
        engineers: {
          __args: {
            filter: { isCoreTeam: { eq: false } },
            first: PAGE_SIZE,
            after: cursor,
          },
          edges: { node: { id: true, ghLogin: true } },
          pageInfo: { hasNextPage: true, endCursor: true },
        },
      });
      const conn =
        (res.engineers as
          | (Connection<{ id: string; ghLogin: string | null }> & {
              totalCount?: number;
            })
          | undefined) ?? {
          edges: [],
          pageInfo: { hasNextPage: false, endCursor: null },
        };
      for (const e of conn.edges) {
        if (isIgnoredGithubHandle(e.node.ghLogin)) continue;
        if (isAlumniGithubHandle(e.node.ghLogin)) continue;
        externalContributorsLifetime++;
      }
      if (!conn.pageInfo.hasNextPage || !conn.pageInfo.endCursor) break;
      cursor = conn.pageInfo.endCursor;
    }
  }

  // Build month buckets (last MONTHS_BACK months, current included).
  const buckets: MonthBucket[] = [];
  const bucketIndex = new Map<string, number>();
  for (let i = MONTHS_BACK - 1; i >= 0; i--) {
    const d = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - i, 1),
    );
    const key = monthKey(d);
    bucketIndex.set(key, buckets.length);
    buckets.push({
      month: key,
      externalPrsMerged: 0,
      externalIssuesOpened: 0,
    });
  }

  // Aggregate.
  let externalPrsMergedThisMonth = 0;
  let externalIssuesOpenedThisMonth = 0;
  const activeAuthorsThisMonth = new Set<string>();
  const mergedCounts = new Map<string, number>();
  const reviewCounts = new Map<string, number>();

  for (const pr of mergedResult.items) {
    if (!pr.authorId || !pr.mergedAt) continue;
    if (!externalEngineers.has(pr.authorId)) continue;
    const t = new Date(pr.mergedAt).getTime();
    if (t < rangeStartMs) continue;
    const key = monthKey(new Date(pr.mergedAt));
    const idx = bucketIndex.get(key);
    if (idx !== undefined) buckets[idx].externalPrsMerged++;
    mergedCounts.set(pr.authorId, (mergedCounts.get(pr.authorId) ?? 0) + 1);
    if (t >= monthStartMs) {
      externalPrsMergedThisMonth++;
      activeAuthorsThisMonth.add(pr.authorId);
    }
  }

  for (const issue of issuesResult.items) {
    if (!issue.authorId || !issue.githubCreatedAt) continue;
    if (!externalEngineers.has(issue.authorId)) continue;
    const t = new Date(issue.githubCreatedAt).getTime();
    if (t < rangeStartMs) continue;
    const key = monthKey(new Date(issue.githubCreatedAt));
    const idx = bucketIndex.get(key);
    if (idx !== undefined) buckets[idx].externalIssuesOpened++;
    if (t >= monthStartMs) externalIssuesOpenedThisMonth++;
  }

  for (const r of reviewsResult.items) {
    if (!r.reviewerId || !r.firstSubmittedAt) continue;
    if (!externalEngineers.has(r.reviewerId)) continue;
    const t = new Date(r.firstSubmittedAt).getTime();
    if (t < rangeStartMs) continue;
    reviewCounts.set(r.reviewerId, (reviewCounts.get(r.reviewerId) ?? 0) + 1);
  }

  const toLeaderboard = (counts: Map<string, number>): LeaderRow[] =>
    Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, TOP_N)
      .map(([id, count]) => {
        const eng = externalEngineers.get(id);
        return {
          id,
          name: eng?.name ?? null,
          ghLogin: eng?.ghLogin ?? null,
          avatarUrl: eng?.avatarUrl ?? null,
          count,
        };
      });

  return {
    rangeStart: rangeStart.toISOString(),
    rangeEnd: now.toISOString(),
    monthsBack: MONTHS_BACK,
    kpis: {
      externalContributorsLifetime,
      activeExternalContributorsThisMonth: activeAuthorsThisMonth.size,
      externalPrsMergedThisMonth,
      externalIssuesOpenedThisMonth,
    },
    byMonth: buckets,
    topMerged: toLeaderboard(mergedCounts),
    topReviewed: toLeaderboard(reviewCounts),
    truncated: {
      prs: mergedResult.truncated,
      issues: issuesResult.truncated,
      reviews: reviewsResult.truncated,
    },
  };
};

export default defineLogicFunction({
  universalIdentifier: 'b3a1d4f7-9c52-4e08-a76d-2f4c8e1b5d93',
  name: 'external-contributions',
  description:
    'Aggregates external-only (isCoreTeam=false, bots excluded) contribution data over the last 24 months: KPIs, monthly PR/issue volumes, and lifetime top contributors by merged PRs and reviews. Backs the External Contributions dashboard.',
  timeoutSeconds: 120,
  handler,
  httpRouteTriggerSettings: {
    path: '/contributors/external-contributions',
    httpMethod: 'POST',
    isAuthRequired: true,
  },
});
