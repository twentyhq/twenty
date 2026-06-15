import { CoreApiClient } from 'twenty-client-sdk/core';

export type CursorName = 'primary' | 'reverse';

export type SyncCursor = {
  id: string;
  lastCursorAt: string | null;
  lastCursorId: string | null;
};

const findCursor = async (
  client: CoreApiClient,
  name: CursorName,
): Promise<SyncCursor | undefined> => {
  const existing = await client.query({
    tftSyncCursors: {
      __args: { filter: { name: { eq: name } }, first: 1 },
      edges: { node: { id: true, lastCursorAt: true, lastCursorId: true } },
    },
  } as any);
  return (existing as any).tftSyncCursors?.edges?.[0]?.node as SyncCursor | undefined;
};

// The tftSyncCursor object holds one row per reconciliation direction, keyed by `name`:
//   'primary' → forward backstop (TFT → Partners, reconcile-opportunities)
//   'reverse' → echo backstop   (Partners → TFT, reconcile-echoes)
// `name` is unique, so a concurrent create loses with a unique-violation rather than
// forking a second row; we then re-read the race winner (repo's get-or-create pattern).
export async function getOrCreateCursor(
  client: CoreApiClient,
  name: CursorName,
): Promise<SyncCursor> {
  const found = await findCursor(client, name);
  if (found) return found;

  try {
    const created = await client.mutation({
      createTftSyncCursor: {
        __args: { data: { name, status: 'IDLE' } },
        id: true,
      },
    } as any);
    return {
      id: (created as any).createTftSyncCursor?.id as string,
      lastCursorAt: null,
      lastCursorId: null,
    };
  } catch (createError) {
    if (!isUniqueViolationError(createError)) throw createError;
    const raceWinner = await findCursor(client, name);
    if (raceWinner) return raceWinner;
    throw createError;
  }
}

const isUniqueViolationError = (error: unknown): boolean => {
  const text =
    error instanceof Error
      ? error.message
      : typeof error === 'object' && error !== null
        ? JSON.stringify(error)
        : typeof error === 'string'
          ? error
          : '';
  const lower = text.toLowerCase();
  return (
    lower.includes('duplicate') ||
    lower.includes('unique constraint') ||
    lower.includes('uniqueness') ||
    lower.includes('already exists') ||
    lower.includes('violates unique')
  );
};

export type RowOutcome = 'ok' | 'skip' | 'error';

// Cursor-driven reconciliation driver shared by both backstop crons. Keyset pagination on
// (updatedAt, id) so rows that share a millisecond are never skipped and processed rows are
// never re-scanned:
//   - Drains the whole backlog (pages of `pageSize` until a short page), bounded by
//     `maxPages` for the cron timeout.
//   - Advances the watermark to the (updatedAt, id) of the last successfully processed (or
//     intentionally skipped) row.
//   - Stops at the first failed row WITHOUT advancing past it, so the next run retries from
//     there — a failed sync is never silently skipped.
// `fetchPage(sinceAt, sinceId)` must return up to `pageSize` rows strictly after the cursor,
// ordered by (updatedAt asc, id asc). On the first run `sinceId` is null → order by updatedAt
// from the epoch.
export async function drainByCursor<TRow>(params: {
  sinceAt: string;
  sinceId: string | null;
  pageSize?: number;
  maxPages?: number;
  fetchPage: (sinceAt: string, sinceId: string | null) => Promise<TRow[]>;
  updatedAtOf: (row: TRow) => string;
  idOf: (row: TRow) => string;
  processRow: (row: TRow) => Promise<RowOutcome>;
}): Promise<{
  reconciled: number;
  errors: number;
  newCursorAt: string;
  newCursorId: string | null;
}> {
  const pageSize = params.pageSize ?? 100;
  const maxPages = params.maxPages ?? 20;

  let cursorAt = params.sinceAt;
  let cursorId = params.sinceId;
  let reconciled = 0;
  let errors = 0;

  for (let page = 0; page < maxPages; page++) {
    const rows = await params.fetchPage(cursorAt, cursorId);
    if (rows.length === 0) break; // caught up — cursor holds the last processed position

    let failed = false;
    for (const row of rows) {
      const outcome = await params.processRow(row);
      if (outcome === 'error') {
        errors++;
        failed = true;
        break; // don't advance past a failure; retry from here next run
      }
      if (outcome === 'ok') reconciled++;
      // 'ok' or 'skip' → safe to advance the keyset watermark past this row.
      cursorAt = params.updatedAtOf(row);
      cursorId = params.idOf(row);
    }

    if (failed) break;
    if (rows.length < pageSize) break; // fully drained
  }

  return { reconciled, errors, newCursorAt: cursorAt, newCursorId: cursorId };
}

// Build the keyset filter for "rows strictly after (sinceAt, sinceId)" merged with a caller
// filter. On the first run (sinceId null) it degrades to `updatedAt >= sinceAt`.
export function keysetFilter(
  sinceAt: string,
  sinceId: string | null,
  extra?: Record<string, unknown>,
): Record<string, unknown> {
  let cursor: Record<string, unknown>;
  if (!sinceId) {
    // Falsy id (null, undefined, or the '' a freshly-added column may hold) = no keyset key
    // yet → fall back to a plain timestamp watermark instead of `id > ''` (an invalid UUID).
    cursor = { updatedAt: { gte: sinceAt } };
  } else {
    // sinceAt is millisecond-truncated (GraphQL precision) but stored updatedAt has sub-ms
    // precision, so a plain `> sinceAt` would re-match the boundary row forever. Treat the
    // millisecond as the unit: rows in a strictly-later ms, OR the same ms with a larger id.
    const nextMs = new Date(Date.parse(sinceAt) + 1).toISOString();
    cursor = {
      or: [
        { updatedAt: { gte: nextMs } },
        {
          and: [
            { updatedAt: { gte: sinceAt } },
            { updatedAt: { lt: nextMs } },
            { id: { gt: sinceId } },
          ],
        },
      ],
    };
  }
  return extra ? { and: [extra, cursor] } : cursor;
}
