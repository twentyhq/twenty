# Kanban board stress test: fitness for large-scale instances

Date: 2026-10-30. Commit under test: 887478f7. Method: five adversarial review agents, each attacking one surface (server SQL, frontend pagination, rendering and memory, drag-and-drop position math, realtime and multi-user), required to tag every finding CONFIRMED (reproduced by a passing jest test, a node trace, or real Postgres timings) or PLAUSIBLE (code trace only), and to list refuted hypotheses. Coordinator spot-checked the highest-severity claims against the code.

## Verdict

Not fit for large-scale instances today. The board works well at the sizes it is tested at (a few hundred records per object), but three independent limits are reached long before "large scale":

1. Server: every page of every column is a full sort of the whole filtered object. Measured on 1M opportunities: 1.1 s per page at any offset, and a 4-CPU server tops out at 1.6 pages per second for all users combined.
2. Frontend: no virtualization, and every column paginates in lockstep. 143 DOM elements and about 230 jotai subscriptions per card, re-rendered in full on every drag start, drag end, drop, fetch-more and metadata refresh.
3. Correctness: offset pagination without an id tiebreaker produces duplicate and missing cards after ordinary moves, and position math exhausts double precision after 53 drops between the same two neighbours with no rebalancing anywhere.

Realistic ceiling with the current design: roughly 5k to 20k records per board object and 10 to 20 columns before latency and duplicate cards become a daily complaint; a 100k-record pipeline with 20 users is not usable.

## Measured numbers

Server (Postgres 16, 1,000,000-row opportunity table, 20 stages, indexes exactly as declared in the standard object, 4 vCPU):

| Query | Time |
|---|---|
| Kanban page, 14 columns selected, offset 0 / 100 / 1,000 / 10,000 | 1,163 / 1,078 / 1,133 / 1,124 ms |
| Same, 32 columns selected | 2,795 ms |
| Same, sorted by Company (many-to-one join) | 3,849 ms |
| Column-header aggregate query | 398 ms |
| Groups query that precedes every page | 375 ms |
| pgbench, 1 / 10 / 20 concurrent clients | 1.2 s / 6.0 s / 12.5 s latency, 1.6 pages/s max |
| Per-group LATERAL with matching `(stage, position NULLS FIRST, id)` index, offset 0 / 10,000 | 1 ms / 265 ms |
| Keyset cursor with that index | 0.28 ms |
| API groupBy on a free-text field with `limit: 1999` (OR chain) vs same as `IN` | 28,238 ms vs 113 ms |

Frontend (jsdom, real board components, 8 visible fields; relative indicators):

| Metric | Value |
|---|---|
| DOM elements per card | 143 |
| jotai subscriptions per card | about 230 |
| Cards re-rendered on drag start / drag end / drop flag on / drop flag off, 200-card column | 200 each (4 full re-renders per drag) |
| Cards re-rendered to append 10 via fetch-more to a 200-card column | 220 |
| `getBoundingClientRect` calls per mousemove during drag-select, 200 cards | 401 |
| Select-all over 400 ids with 30 columns x 1000 ids in store | 32 s (quadratic) |
| Drops between the same two neighbours before positions collide | 53 (37 near import magnitudes) |

## Findings by severity

### Blockers

B1. Full-partition window function per page. `group-by-with-records.service.ts` computes `ROW_NUMBER() OVER (PARTITION BY group ORDER BY ...)` over the entire filtered set and applies the page only inside a `JSONB_AGG ... FILTER`, so Postgres cannot stop early. No index on `position` exists and the UI orders `ASC NULLS FIRST`, so even a composite index is unusable. Scrolling a 300k column to the bottom costs 30,000 pages x 0.6 s. CONFIRMED with EXPLAIN ANALYZE.

B2. No virtualization; lockstep pagination. `RecordBoardColumnCardsContainer.tsx` renders every loaded id. A single full-width trigger below all columns fetches the next page for every column that has more, with a serial 50 ms sleep per column (`useTriggerRecordBoardFetchMore.ts`). 30 columns scrolled to depth 1000 means 30,000 mounted cards, about 4.3M DOM elements, 150 s of sleep and roughly 1.5M card renders. CONFIRMED by measurement and arithmetic.

B3. Duplicate and missing cards after normal use. Fetch-more uses one shared offset for all columns and concatenates ids without dedupe. Any cross-column drag, any create by another user inside the loaded prefix, or any tie in sort keys shifts the server row numbers: the next page returns an already-loaded card (duplicate React key, duplicate dnd-kit id) and skips one. The kanban query has no id tiebreaker although the find-many path appends one. CONFIRMED by jest (`useTriggerRecordBoardFetchMore.adversarial.test.tsx`) and by SQL (tied positions, tuple relocation).

B4. Full-board re-render on every drag. Every card reads the board-level `draggedRecordIdsComponentState` and `isRecordBoardDropProcessingComponentState`, so drag start, drag end, and the drop-processing flag toggling twice each re-render every card and re-register every dnd-kit sortable. dnd-kit collision detection iterates all droppables per pointer move and creates two IntersectionObservers per droppable at drag start. CONFIRMED.

### Major

M1. Position exhaustion with no rebalancing. Midpoint halving in `computeNewPositionOfDraggedRecord.ts` hits double-precision limits after 53 drops (37 near the negative magnitudes used by import backfill). After that every drop returns the same value, `computeNewEvenlySpacedPositions` hands N identical positions to a multi-drag, and the server has no uniqueness check, no conflict detection, and no rebalance job. CONFIRMED by node trace and jest.

M2. Drop past the loaded tail lands inside the unloaded tail. Position is computed as last loaded + 1 while the column has hundreds more records; after reload the card sits at row 11, tied with an existing record. CONFIRMED by jest.

M3. Realtime reload storm. Any update by any user that touches a filtered or sorted field, or any position or group change on a record not loaded in this tab, triggers `triggerRecordBoardInitialQuery`: offset reset to 0, every column replaced with page 0, all scrolled pages discarded. With 20 users dropping a card every 10 s on a view filtered by stage, every tab reloads the whole board about twice a second, plus two aggregate refetches per SSE batch. No debounce, no stale-response cancellation. CONFIRMED by jest and code trace.

M4. SSE subscription filter is frozen at first registration. `SSEQuerySubscribeEffect.tsx` diffs required vs active listeners by `queryId` only, so hiding a column or changing a filter never updates the server-side signature: over-delivery after narrowing, missed updates after widening. CONFIRMED by jest.

M5. Multi-drag of N cards = N parallel updateOne mutations, up to 2N aggregate refetches, N board effects; a single failure leaves a ghost card in the target column because the column id arrays are not rolled back. Same ghost-card outcome for a permission-denied drop. CONFIRMED by code trace.

M6. In-flight fetch-more across a filter change appends stale records to the new columns and overwrites the reset offset. CONFIRMED by jest.

M7. Failed fetch-more retries with no backoff; GraphQL-level errors retry in a hot loop while the trigger is in view. CONFIRMED by jest and trace.

M8. Sorting by a relation joins the whole target table on every page (3.8 s per page at 1M). API-only to-many sorts run DISTINCT ON over the entire child table (4.8 s). CONFIRMED by timing.

M9. API-reachable group `limit` has no cap other than the complexity formula (1999); `buildGroupByRecordConditions` emits an OR chain of equalities, 250x slower than `IN`. One request can hold a worker for 28 s. CONFIRMED by timing.

### Medium

- Hiding or reordering a column changes the query identifier (visible values are serialized in column order) and triggers a full reload with scroll reset. CONFIRMED by jest.
- Select-all and drag-select are O(N) per id over the whole store, so select-all is quadratic (32 s for 400 ids with 30k in store). CONFIRMED by measurement.
- Any view or object-metadata refresh (column resize, field toggle, another user's view edit) re-renders every card because selectors return fresh objects. CONFIRMED by measurement.
- Records are never evicted from the jotai record store or the per-board id arrays; family caches are module-level Maps with no eviction. 30k records retained per board visited. CONFIRMED.
- Sorted board: cross-column drop appends locally then the column is re-sorted by position on response, violating the active sort until reload. Code trace.
- `position ?? 0` fallback turns an unknown position into a 0 or a silent no-op. CONFIRMED by jest for the math.
- No cap on visible group count client-side; server caps visibility at 40 on view creation but the frontend optimistic path creates all options visible. Relation grouping mounts one `findOne` per column header.

## Refuted hypotheses (worth knowing)

- The "No value" column: null group values flow correctly end to end (client `is: NULL` filter, server `IS NULL`, strict equality on the client).
- Row-level permissions do not add joins that multiply window cost; they shrink the partition.
- `JSONB_BUILD_OBJECT` chunking at 50 pairs is correct; no breaking point by column count.
- Column header aggregates are one grouped query per board, not one per column (but refetched on every SSE batch).
- Single-card hover, focus, selection, and single-field SSE updates re-render only that card or leaf.
- A second drop within the 500 ms processing window is not lost; cards are drag-disabled during it. The real race is responses arriving during a later drag.
- updateMany emits one event per mutation batch, not one per record.
- The 65,535 bind-parameter limit is not reachable from the UI.

## Fix priorities

1. Server pagination: per-group bounded scan (LATERAL with `LIMIT/OFFSET`, or better a keyset cursor on `(sort key, id)` since the client already holds each column's last record), paired with a composite partial index on `(group column, sort column with the UI's NULLS order, id) WHERE deletedAt IS NULL`. Append the id tiebreaker exactly as find-many does. Measured: 1 ms and 0.28 ms versus 1.1 s.
2. Frontend pagination: per-column fetch-more with a per-column sentinel and cursor; dedupe ids on append; discard responses whose request token no longer matches; backoff on failure.
3. Virtualize columns and stop per-card reads of board-level drag state; memoize cards and the column context value; one hover and edit portal per board.
4. Realtime: patch in place instead of reloading; debounce real reloads and preserve the current depth; include the signature in the SSE listener diff; coalesce aggregate refetches.
5. Positions: id tiebreaker, server-side rebalance when a gap closes, `position: 'last'` when dropping past a partially loaded column, batched multi-drag update with atomic rollback.
6. API hardening: cap group `limit` with `includeRecords`, emit `IN` instead of an OR chain, reject to-many sorts on the group-by path.

## Reproduction files

All jest files below pass against the current code; each test asserts the defective behaviour, so a green run is proof of the bug. They are evidence, not regression tests, and should not be merged as-is (the perf harness takes about 2.5 minutes).

- `packages/twenty-front/src/modules/object-record/record-board/hooks/__tests__/useTriggerRecordBoardFetchMore.adversarial.test.tsx`
- `packages/twenty-front/src/modules/object-record/record-board/hooks/__tests__/useRepositionRecordsOnBoard.adversarial.test.tsx`
- `packages/twenty-front/src/modules/object-record/record-board/hooks/__tests__/recordBoardQueryIdentifierGroupOrder.realtime.adversarial.test.ts`
- `packages/twenty-front/src/modules/object-record/record-board/hooks/__tests__/recordBoardUpdateEffects.realtime.adversarial.test.tsx`
- `packages/twenty-front/src/modules/object-record/record-board/record-board-column/components/__tests__/RecordBoardColumnCardsContainer.scale.perf.test.tsx` (run with `NODE_OPTIONS=--expose-gc ... --runInBand`)
- `packages/twenty-front/src/modules/object-record/record-drag/utils/__tests__/computeDroppedRecordPositionsAtScale.adversarial.test.ts`
- `packages/twenty-front/src/modules/object-record/utils/__tests__/computeNewPositionOfDraggedRecord.exhaustion.adversarial.test.ts`
- `packages/twenty-front/src/modules/sse-db-event/components/__tests__/SSEQuerySubscribeEffectStaleSignature.realtime.adversarial.test.tsx`

Run: `npx jest <file> --config=packages/twenty-front/jest.config.mjs`.

The SQL benchmark scripts and raw EXPLAIN output were produced outside the repo and are not committed; the shapes are described in B1, M8 and M9 and reproduce from `buildRankedRecordsStatement`.
