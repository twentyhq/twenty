# Task 1 report — listed-brief Discord service + query

## Status
DONE

## What was done

Created the record-based Discord ping for marketplace-listed briefs, TDD as specified:

1. Wrote the 6 unit tests first. First run failed with `Cannot find module .../notify-listed-brief.service` (expected red).
2. Added `getListedBriefDetails` — list-form read (`filter: { id: { eq } }, first: 1, edges.node`) selecting id, name, need, requirements, company.name, pointOfContact.name, referredByPartner.name.
3. Added `notifyListedBrief(opportunityId): Promise<void>` — never throws. No webhook URL → no read, no post. Missing opportunity (empty edges) → silent return. Read or Discord failure is swallowed. Embed title is `Brief listed on the marketplace`; description is truncated need, or the opportunity name if need is empty; Company / Contact / Referred by / Requirements fields are omitted when empty.

## Checks run

- RED: `npx vitest run --project unit src/modules/opportunity/matching/services/notify-listed-brief.service.test.ts` — FAIL, cannot resolve `./notify-listed-brief.service`.
- GREEN: same command — 6 passed, 0 failed.
- `npx oxlint` on the three new files — 0 warnings, 0 errors.
- `npx tsc -p tsconfig.json --noEmit` — TS6305 storm on every source file (stale composite `dist/*.d.ts` from `tsconfig.spec.json` project references). Pre-existing in this environment; documented on prior task reports. `npx tsc -p tsconfig.json --noEmit --disableReferencedProjectLoad` — exit 0, no type errors.

## Files created (committed)

- `packages/twenty-apps/internal/twenty-partners/src/modules/opportunity/matching/graphql/queries/get-listed-brief-details.ts`
- `packages/twenty-apps/internal/twenty-partners/src/modules/opportunity/matching/services/notify-listed-brief.service.ts`
- `packages/twenty-apps/internal/twenty-partners/src/modules/opportunity/matching/services/notify-listed-brief.service.test.ts`

## Commit

`923bf5810f7a6a69f1fa34e419d0e6661c4df088` — `feat(partners): add a record-based Discord ping for listed briefs`

Only the three files above were staged and committed.

## Test summary

6 passed (posts embed from the record; no-op without webhook URL; silent on missing opportunity; swallows read failure; swallows webhook failure; omits empty fields and falls back to name as description).

## Concerns for the reviewer

- Truncation (`NEED_MAX` 600, `REQUIREMENTS_MAX` 300) is implemented but not covered by the brief's tests.
- `inline()` does not trim field values (unlike `brief-embed.mapper`'s `inlineField`); this matches the brief's verbatim service.
- T2 can import `notifyListedBrief` from `src/modules/opportunity/matching/services/notify-listed-brief.service` with signature `(opportunityId: string) => Promise<void>`.
