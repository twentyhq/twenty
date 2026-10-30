# Kanban easy wins: measured before and after

Companion to `KANBAN_SCALE_STRESS_TEST.md`. Two change sets on this branch:

- Frontend (commits 75139d6b, 25b8ec1c): no per-card reads of board-level drag state, memoized cards and stable column context, dedupe and stale-page discard and exponential backoff in fetch-more, no serial sleep between columns.
- Server (commits 4b7c40bc, 88dedacd): page predicate in the outer WHERE, group scope as an IN list, id tiebreaker on the ranked records.

Both were reviewed by adversarial agents standing in for PR review and CI; no blockers remained after the follow-up commits. All numbers below were measured on this machine with the same harness or SQL before and after the change.

## Frontend (jsdom perf harness, 200-card column, 8 visible fields)

Card re-renders per board-level state change:

| Action | Before | After |
|---|---|---|
| Drag start | 200 cards, 1,600 cells, 3,708 ms | 0 cards, 0 ms |
| Drag end | 200 cards, 1,600 cells, 3,775 ms | 0 cards, 0 ms |
| Drop-processing flag on | 200 cards, 1,600 cells, 4,197 ms | 0 cards, 0 ms |
| Drop-processing flag off (500 ms later) | 200 cards, 1,600 cells, 4,586 ms | 0 cards, 0 ms |
| Fetch-more appends 10 cards | 220 cards, 1,760 cells, 3,955 ms | 20 cards, 160 cells, 595 ms |
| Focus / select one card | 1 card | 1 card (unchanged) |
| Mount 200 cards | 8,486 ms | 7,565 ms (noise) |

Per drag that is four full-board re-renders removed. Append cost is now proportional to the page, not the column: at 1,000 loaded cards it was 1,010 renders per page and is now 20.

Fetch-more timing per page at 30 columns: 1.5 s of serial sleep removed (50 ms x 30).

Not changed by this batch (still full-board re-renders): view or object metadata refresh, which stays at 210 card renders per event.

## Server (Postgres 16, 1,000,000-row opportunity table, 20 stages, warm cache)

Kanban page query, 14 selected columns, with the id tiebreaker included in the after shape:

| Query | Before | After |
|---|---|---|
| Page at offset 0 | 1,085 ms | 744 ms |
| Page at offset 10,000 | 1,113 ms | 796 ms |
| API groupBy on a free-text field, limit 1999, includeRecords | 17,636 ms | 122 ms |

The partitioned sort is still a full sort of every filtered row, so the kanban page is about 30 percent faster, not an order of magnitude. The order-of-magnitude fix remains the per-group bounded scan with a composite index (1 ms at offset 0, 265 ms at offset 10,000 in the stress-test bench) and is not part of this batch.

The 1999-group case is the API denial-of-service path from the stress test (M9); it is now 145x faster.

## Correctness changes (not timing)

- Pages within a column are deterministic under tied sort keys (id tiebreaker).
- A card returned twice by offset drift no longer duplicates in a column (dedupe).
- A page that resolves after a filter change or board reload is discarded instead of being appended to the new columns.
- A failing fetch-more retries with 1 s, 2 s, 4 s ... up to 30 s backoff instead of a hot loop, and the backoff is cancelled by a new board query.

## How to reproduce

Frontend: `NODE_OPTIONS=--expose-gc npx jest packages/twenty-front/src/modules/object-record/record-board/record-board-column/components/__tests__/RecordBoardColumnCardsContainer.scale.perf.test.tsx --config=packages/twenty-front/jest.config.mjs --runInBand` on the commit before and after.

Server: the SQL shapes are those built by `buildRankedRecordsStatement` before and after 4b7c40bc, run with `EXPLAIN (ANALYZE, SUMMARY)` against a 1M-row table with the standard opportunity indexes.
