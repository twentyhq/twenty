# Task 2 report — on-opportunity-listed logic function

## Status
DONE

## What was done

Created the database-event trigger that pings Discord on an `isListed` false→true flip:

1. Added `ON_OPPORTUNITY_LISTED_FN_UNIVERSAL_IDENTIFIER = 'ebbb2911-57e5-4edd-bd93-4a28939115c0'` next to `ON_OPPORTUNITY_INTRO_SENT_FN_UNIVERSAL_IDENTIFIER`.
2. Wrote the 5 unit tests first. First run failed with `Cannot find module .../on-opportunity-listed.logic-function` (expected red).
3. Added `handler` + `defineLogicFunction` default export. Trigger is `opportunity.updated` with `updatedFields: ['isListed']`. Guards: no `isListed` in `updatedFields` or no `after.id` → `{}`; `before.isListed === true` or `after.isListed !== true` → `{ skipped: true, reason: 'not_a_listing_flip' }`; otherwise `notifyListedBrief(after.id)` and `{ notified: true, opportunityId }`.

The public form is not this function's job: form briefs are born listed and never flip.

## Checks run

- RED: `npx vitest run --project unit src/modules/opportunity/matching/on-opportunity-listed.test.ts` — FAIL, cannot resolve `./on-opportunity-listed.logic-function`.
- GREEN: same command — 5 passed, 0 failed.
- `yarn test:unit` — 38 files, 271 tests, all passed (no regressions).
- `npx oxlint` on the three touched files — 0 warnings, 0 errors.
- `npx tsc -p tsconfig.json --noEmit` — pre-existing TS6305 storm (stale composite `dist/*.d.ts` from `tsconfig.spec.json` project references). Same environment issue as Task 1. No type error unique to these files.

## Files created or modified (committed)

- `packages/twenty-apps/internal/twenty-partners/src/constants/universal-identifiers.ts` (one new constant)
- `packages/twenty-apps/internal/twenty-partners/src/modules/opportunity/matching/on-opportunity-listed.logic-function.ts` (new)
- `packages/twenty-apps/internal/twenty-partners/src/modules/opportunity/matching/on-opportunity-listed.test.ts` (new)

## Commit

`969659578c40ba6132740456b695084f08d823b1` — `feat(partners): ping Discord when a brief is hand-listed on the marketplace`

Only the three files above were staged and committed.

## Test summary

5 passed (notifies on false→true; silent on true→false; silent when already true; no-op without record id; no-op when `isListed` is not in `updatedFields`). Full unit suite 271 passed.

## Concerns for the reviewer

- `before?.isListed === true` treats `undefined`/`false`/`null` as a listing flip when `after.isListed === true`. That matches the brief. An import that writes `isListed: true` on create is an `opportunity.created` event, not `updated`, so it does not fire this trigger (form-born listed briefs stay on the in-route ping).
- The function registers itself in the manifest at `yarn twenty apply`. That apply is out of this task's scope.
