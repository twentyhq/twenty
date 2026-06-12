import { CoreApiClient } from 'twenty-client-sdk/core';

export type SyncCursor = { id: string; lastCursorAt: string | null };

// The tftSyncCursor object holds one row per reconciliation direction, keyed by `name`:
//   'primary' → forward backstop (TFT → Partners, reconcile-opportunities)
//   'reverse' → echo backstop   (Partners → TFT, reconcile-echoes)
// Scoping by name keeps the two crons from advancing each other's watermark.
export type CursorName = 'primary' | 'reverse';

export async function getOrCreateCursor(
  client: CoreApiClient,
  name: CursorName,
): Promise<SyncCursor> {
  const existing = await client.query({
    tftSyncCursors: {
      __args: { filter: { name: { eq: name } }, first: 1 },
      edges: { node: { id: true, lastCursorAt: true } },
    },
  } as any);

  const row = (existing as any).tftSyncCursors?.edges?.[0]?.node as SyncCursor | undefined;
  if (row) return row;

  const created = await client.mutation({
    createTftSyncCursor: {
      __args: { data: { name, status: 'IDLE' } },
      id: true,
    },
  } as any);
  return {
    id: (created as any).createTftSyncCursor?.id as string,
    lastCursorAt: null,
  };
}

export type RowOutcome = 'ok' | 'skip' | 'error';

// Cursor-driven reconciliation driver shared by both backstop crons. It owns the tricky
// watermark math so it lives in exactly one place:
//   - Drains the whole backlog (pages of `pageSize` until a short page), bounded by
//     `maxPages` for the cron timeout — a backlog > pageSize is fully processed in one run.
//   - Advances the watermark just PAST a fully-processed page (+1ms) so the boundary row
//     isn't re-scanned forever.
//   - On the first failed row, clamps the watermark to just BEFORE it so the next run
//     retries from there — a failed sync is never silently skipped (the whole point of a
//     backstop). Re-scanning earlier successes is a harmless no-op downstream.
// Rows must be fetched ordered by updatedAt ascending. `updatedAtOf` reads the sort key.
export async function drainByCursor<TRow>(params: {
  since: string;
  runStartedAt: string;
  pageSize?: number;
  maxPages?: number;
  fetchPage: (since: string) => Promise<TRow[]>;
  updatedAtOf: (row: TRow) => string;
  processRow: (row: TRow) => Promise<RowOutcome>;
}): Promise<{ reconciled: number; errors: number; newCursorAt: string }> {
  const pageSize = params.pageSize ?? 100;
  const maxPages = params.maxPages ?? 20;

  let cursorAt = params.since;
  let reconciled = 0;
  let errors = 0;

  for (let page = 0; page < maxPages; page++) {
    const rows = await params.fetchPage(cursorAt);
    if (rows.length === 0) {
      cursorAt = params.runStartedAt;
      break;
    }

    let earliestFailureAt: string | null = null;
    let lastRowAt = cursorAt;
    for (const row of rows) {
      lastRowAt = params.updatedAtOf(row);
      const outcome = await params.processRow(row);
      if (outcome === 'ok') {
        reconciled++;
      } else if (outcome === 'error') {
        errors++;
        if (earliestFailureAt === null) earliestFailureAt = params.updatedAtOf(row);
      }
    }

    if (earliestFailureAt !== null) {
      // Retry from the earliest failure next run (−1ms so `gte` re-includes it and any
      // same-timestamp siblings). Stop draining; don't skip past unprocessed failures.
      cursorAt = new Date(Date.parse(earliestFailureAt) - 1).toISOString();
      break;
    }
    if (rows.length < pageSize) {
      cursorAt = params.runStartedAt; // fully drained, caught up to now
      break;
    }
    // Full page, all clear → step just past the last row and drain the next page.
    cursorAt = new Date(Date.parse(lastRowAt) + 1).toISOString();
  }

  return { reconciled, errors, newCursorAt: cursorAt };
}
