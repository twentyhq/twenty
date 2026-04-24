import { defineLogicFunction, type RoutePayload } from 'twenty-sdk/define';
import { getClient } from 'src/modules/shared/twenty-client';

export type StatsPeriod = 'week' | 'month' | '3months' | 'year';

type Granularity = 'day' | 'week' | 'month';

type Bucket = {
  key: string;
  label: string;
  start: string;
  end: string;
  prAuthored: number;
  prMerged: number;
  prReviewed: number;
};

type Totals = {
  prAuthored: number;
  prMerged: number;
  prReviewed: number;
};

type ContributorInfo = {
  id: string;
  name: string | null;
  ghLogin: string | null;
  avatarUrl: string | null;
};

type ContributorStatsPayload = {
  contributorId?: string;
  period?: StatsPeriod;
};

type ContributorStatsResponse =
  | {
      contributor: ContributorInfo;
      period: StatsPeriod;
      granularity: Granularity;
      buckets: Bucket[];
      totals: Totals;
      truncated: {
        prAuthored: boolean;
        prMerged: boolean;
        prReviewed: boolean;
      };
    }
  | { error: string };

const PAGE_SIZE = 100;
const MAX_PAGES = 30;

const PERIOD_CONFIG: Record<
  StatsPeriod,
  { granularity: Granularity; rangeMs: number; bucketCount: number }
> = {
  week: { granularity: 'day', rangeMs: 7 * 24 * 3600 * 1000, bucketCount: 7 },
  month: { granularity: 'day', rangeMs: 30 * 24 * 3600 * 1000, bucketCount: 30 },
  '3months': {
    granularity: 'week',
    rangeMs: 13 * 7 * 24 * 3600 * 1000,
    bucketCount: 13,
  },
  year: {
    granularity: 'month',
    rangeMs: 365 * 24 * 3600 * 1000,
    bucketCount: 12,
  },
};

const startOfUtcDay = (d: Date): Date =>
  new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));

const startOfUtcWeek = (d: Date): Date => {
  const day = startOfUtcDay(d);
  const dow = day.getUTCDay();
  const diff = (dow + 6) % 7;
  day.setUTCDate(day.getUTCDate() - diff);
  return day;
};

const startOfUtcMonth = (d: Date): Date =>
  new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1));

const addBucket = (start: Date, granularity: Granularity, n: number): Date => {
  const out = new Date(start);
  if (granularity === 'day') out.setUTCDate(out.getUTCDate() + n);
  else if (granularity === 'week') out.setUTCDate(out.getUTCDate() + 7 * n);
  else out.setUTCMonth(out.getUTCMonth() + n);
  return out;
};

const bucketStartFor = (d: Date, granularity: Granularity): Date => {
  if (granularity === 'day') return startOfUtcDay(d);
  if (granularity === 'week') return startOfUtcWeek(d);
  return startOfUtcMonth(d);
};

const formatBucketLabel = (start: Date, granularity: Granularity): string => {
  const month = start.toLocaleString('en-US', { month: 'short', timeZone: 'UTC' });
  if (granularity === 'month') {
    return `${month} ${String(start.getUTCFullYear()).slice(2)}`;
  }
  return `${month} ${start.getUTCDate()}`;
};

const buildBuckets = (
  now: Date,
  period: StatsPeriod,
): { buckets: Bucket[]; rangeStart: Date; granularity: Granularity } => {
  const { granularity, bucketCount } = PERIOD_CONFIG[period];
  const lastBucketStart = bucketStartFor(now, granularity);
  const firstBucketStart = addBucket(
    lastBucketStart,
    granularity,
    -(bucketCount - 1),
  );

  const buckets: Bucket[] = [];
  for (let i = 0; i < bucketCount; i++) {
    const start = addBucket(firstBucketStart, granularity, i);
    const end = addBucket(start, granularity, 1);
    buckets.push({
      key: start.toISOString(),
      label: formatBucketLabel(start, granularity),
      start: start.toISOString(),
      end: end.toISOString(),
      prAuthored: 0,
      prMerged: 0,
      prReviewed: 0,
    });
  }
  return { buckets, rangeStart: firstBucketStart, granularity };
};

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

type MergedPrNode = { mergedAt: string | null };
type ReviewNode = { firstSubmittedAt: string | null };

const fetchContributorInfo = async (
  contributorId: string,
): Promise<ContributorInfo | null> => {
  const client = getClient();
  const res = await client.query({
    contributors: {
      __args: { filter: { id: { eq: contributorId } }, first: 1 },
      edges: {
        node: {
          id: true,
          name: true,
          ghLogin: true,
          avatarUrl: { primaryLinkUrl: true },
        },
      },
    },
  });
  const node = res.contributors?.edges?.[0]?.node;
  if (!node) return null;
  return {
    id: node.id,
    name: node.name ?? null,
    ghLogin: node.ghLogin ?? null,
    avatarUrl: node.avatarUrl?.primaryLinkUrl ?? null,
  };
};

const handler = async (
  event: RoutePayload<ContributorStatsPayload>,
): Promise<ContributorStatsResponse> => {
  const contributorId = event.body?.contributorId;
  const period: StatsPeriod = event.body?.period ?? 'month';

  if (!contributorId) {
    return { error: 'contributorId is required' };
  }
  if (!(period in PERIOD_CONFIG)) {
    return { error: `Unsupported period: ${period}` };
  }

  const contributor = await fetchContributorInfo(contributorId);
  if (!contributor) {
    return { error: 'Contributor not found' };
  }

  const now = new Date();
  const { buckets, rangeStart, granularity } = buildBuckets(now, period);
  const rangeStartMs = rangeStart.getTime();
  const bucketIndex = new Map<string, number>();
  buckets.forEach((b, i) => bucketIndex.set(b.key, i));

  const client = getClient();

  const mergedResult = await paginateUntil<MergedPrNode>(
    async (cursor) => {
      const res = await client.query({
        pullRequests: {
          __args: {
            filter: {
              and: [
                { mergerId: { eq: contributorId } },
                { state: { eq: 'MERGED' } },
              ],
            },
            orderBy: [{ mergedAt: 'DescNullsLast' }],
            first: PAGE_SIZE,
            after: cursor,
          },
          edges: { node: { mergedAt: true } },
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

  const authoredResult = await paginateUntil<MergedPrNode>(
    async (cursor) => {
      const res = await client.query({
        pullRequests: {
          __args: {
            filter: {
              and: [
                { authorId: { eq: contributorId } },
                { state: { eq: 'MERGED' } },
              ],
            },
            orderBy: [{ mergedAt: 'DescNullsLast' }],
            first: PAGE_SIZE,
            after: cursor,
          },
          edges: { node: { mergedAt: true } },
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

  const reviewedResult = await paginateUntil<ReviewNode>(
    async (cursor) => {
      const res = await client.query({
        pullRequestReviews: {
          __args: {
            filter: { reviewerId: { eq: contributorId } },
            orderBy: [{ firstSubmittedAt: 'DescNullsLast' }],
            first: PAGE_SIZE,
            after: cursor,
          },
          edges: { node: { firstSubmittedAt: true } },
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

  const totals: Totals = { prAuthored: 0, prMerged: 0, prReviewed: 0 };

  for (const pr of authoredResult.items) {
    if (!pr.mergedAt) continue;
    const d = new Date(pr.mergedAt);
    if (d.getTime() < rangeStartMs) continue;
    const key = bucketStartFor(d, granularity).toISOString();
    const idx = bucketIndex.get(key);
    if (idx === undefined) continue;
    buckets[idx].prAuthored++;
    totals.prAuthored++;
  }

  for (const pr of mergedResult.items) {
    if (!pr.mergedAt) continue;
    const d = new Date(pr.mergedAt);
    if (d.getTime() < rangeStartMs) continue;
    const key = bucketStartFor(d, granularity).toISOString();
    const idx = bucketIndex.get(key);
    if (idx === undefined) continue;
    buckets[idx].prMerged++;
    totals.prMerged++;
  }

  for (const r of reviewedResult.items) {
    if (!r.firstSubmittedAt) continue;
    const d = new Date(r.firstSubmittedAt);
    if (d.getTime() < rangeStartMs) continue;
    const key = bucketStartFor(d, granularity).toISOString();
    const idx = bucketIndex.get(key);
    if (idx === undefined) continue;
    buckets[idx].prReviewed++;
    totals.prReviewed++;
  }

  return {
    contributor,
    period,
    granularity,
    buckets,
    totals,
    truncated: {
      prAuthored: authoredResult.truncated,
      prMerged: mergedResult.truncated,
      prReviewed: reviewedResult.truncated,
    },
  };
};

export default defineLogicFunction({
  universalIdentifier: 'a3c9e1b6-2f47-4d8a-9b0f-7e6d1a2c3b4f',
  name: 'contributor-stats',
  description:
    'Returns time-bucketed counts of PRs authored (merged only), merged and reviewed by a contributor over the selected period.',
  timeoutSeconds: 30,
  handler,
  httpRouteTriggerSettings: {
    path: '/contributors/stats',
    httpMethod: 'POST',
    isAuthRequired: true,
  },
});
