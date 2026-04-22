import { defineLogicFunction, type RoutePayload } from 'twenty-sdk/define';
import { getClient } from 'src/modules/shared/twenty-client';
import { isIgnoredGithubHandle } from 'src/modules/github/contributor/constants/ignored-contributors';
import { isAlumniGithubHandle } from 'src/modules/github/contributor/constants/alumni-contributors';

type Payload = Record<string, never>;

type Response = {
  count: number;
  rangeStart: string;
  rangeEnd: string;
  truncated: boolean;
};

const PAGE_SIZE = 100;
const MAX_PAGES = 50;
const ENGINEER_BATCH = 100;

type Edge<T> = { node: T };
type Connection<T> = {
  edges: Edge<T>[];
  pageInfo: { hasNextPage: boolean; endCursor: string | null };
};

type MergedPrNode = { mergedAt: string | null; authorId: string | null };
type EngineerNode = {
  id: string;
  ghLogin: string | null;
  isCoreTeam: boolean | null;
};

const startOfUtcMonth = (d: Date): Date =>
  new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1));

const handler = async (
  _event: RoutePayload<Payload>,
): Promise<Response> => {
  const now = new Date();
  const rangeStart = startOfUtcMonth(now);
  const rangeStartMs = rangeStart.getTime();

  const client = getClient();

  const authorIds = new Set<string>();
  let cursor: string | null = null;
  let truncated = false;

  for (let page = 0; page < MAX_PAGES; page++) {
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
    const conn = (res.pullRequests as Connection<MergedPrNode>) ?? {
      edges: [],
      pageInfo: { hasNextPage: false, endCursor: null },
    };
    let stop = false;
    for (const edge of conn.edges) {
      const node = edge.node;
      if (!node.mergedAt) continue;
      if (new Date(node.mergedAt).getTime() < rangeStartMs) {
        stop = true;
        break;
      }
      if (node.authorId) authorIds.add(node.authorId);
    }
    if (stop) break;
    if (!conn.pageInfo.hasNextPage || !conn.pageInfo.endCursor) break;
    cursor = conn.pageInfo.endCursor;
    if (page === MAX_PAGES - 1) truncated = true;
  }

  if (authorIds.size === 0) {
    return {
      count: 0,
      rangeStart: rangeStart.toISOString(),
      rangeEnd: now.toISOString(),
      truncated,
    };
  }

  const ids = Array.from(authorIds);
  let externalCount = 0;
  for (let i = 0; i < ids.length; i += ENGINEER_BATCH) {
    const batch = ids.slice(i, i + ENGINEER_BATCH);
    const res = await client.query({
      engineers: {
        __args: { filter: { id: { in: batch } }, first: batch.length },
        edges: {
          node: { id: true, ghLogin: true, isCoreTeam: true },
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
      externalCount++;
    }
  }

  return {
    count: externalCount,
    rangeStart: rangeStart.toISOString(),
    rangeEnd: now.toISOString(),
    truncated,
  };
};

export default defineLogicFunction({
  universalIdentifier: 'e7b3a92f-1c4d-4e8f-bd07-2a5c8b1d3e6f',
  name: 'external-contributors-this-month',
  description:
    'Counts distinct external engineers (isCoreTeam=false, bots and alumni excluded) who authored at least one PR merged in the current calendar month.',
  timeoutSeconds: 60,
  handler,
  httpRouteTriggerSettings: {
    path: '/contributors/external-this-month',
    httpMethod: 'POST',
    isAuthRequired: true,
  },
});
