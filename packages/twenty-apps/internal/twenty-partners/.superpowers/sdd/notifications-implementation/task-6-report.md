# Task 6 report — list-digest-recipients workflow-action logic function

## Status
DONE_WITH_CONCERNS

## What was done

Created the workflow-action logic function that Task 3's Daily Digest Iterator will call to resolve partner emails (Find Records loads no relations; Partner has no email column):

1. Added `LIST_DIGEST_RECIPIENTS_FN_UNIVERSAL_IDENTIFIER = '3571d2b3-f90b-48ab-99d8-116d73ddf1d7'` after `ON_OPPORTUNITY_LISTED_FN_UNIVERSAL_IDENTIFIER`.
2. Wrote the 3 unit tests first. First run failed with `Cannot find module .../list-digest-recipients.logic-function` (expected red).
3. Added `getDigestRecipients` — list-form read (`filter: { validationStage: { eq: 'VALIDATED' } }, first: 200, edges.node`) selecting `name` and `partnerUser.userEmail`.
4. Added `handler` + `defineLogicFunction` default export with `workflowActionTriggerSettings: { label: 'List digest recipients', icon: 'IconMail' }`. Skips empty/missing emails; keeps the first name when several partners share one email.

Then `yarn twenty apply` on remote `wt-clean-process-in-partners` (`http://localhost:2020`). Plan: 2 to add, 9 to change, 0 to destroy. `list-digest-recipients` was created with `workflowActionTriggerSettings` accepted (not rejected). Apply also created Task 2's `on-opportunity-listed` (had not been applied yet) and rebuilt checksums on 8 existing logic functions.

## Checks run

- RED: `npx vitest run --project unit src/modules/partner/marketplace/list-digest-recipients.test.ts` — FAIL, cannot resolve `./list-digest-recipients.logic-function`.
- GREEN: same command — 3 passed, 0 failed.
- `yarn test:unit` — 39 files, 274 tests, all passed (no regressions).
- `npx oxlint` on the four touched files — 0 warnings, 0 errors.
- `npx tsc -p tsconfig.json --noEmit` — pre-existing TS6305 storm (stale composite `dist/*.d.ts` from `tsconfig.spec.json` project references). Same environment issue as Tasks 1–2. Filtering out TS6305 leaves zero type errors. `--disableReferencedProjectLoad` is not valid on this tsc CLI (TS6230: option only in tsconfig.json).
- `yarn twenty apply` — succeeded. Manifest has `workflowActionTriggerSettings.label = "List digest recipients"`, `icon = "IconMail"`, inferred `inputSchema = [{ type: "object", properties: {} }]`. No `outputSchema`.

## Files created or modified (committed)

- `packages/twenty-apps/internal/twenty-partners/src/constants/universal-identifiers.ts` (one new constant)
- `packages/twenty-apps/internal/twenty-partners/src/modules/partner/marketplace/graphql/queries/get-digest-recipients.ts` (new)
- `packages/twenty-apps/internal/twenty-partners/src/modules/partner/marketplace/list-digest-recipients.logic-function.ts` (new)
- `packages/twenty-apps/internal/twenty-partners/src/modules/partner/marketplace/list-digest-recipients.test.ts` (new)

## Commit

`9b9ce8d4067812a010dc70d448920ee16232fa22` — `feat(partners): expose digest recipients as a workflow action`

Only the four files above were staged and committed.

## Test summary

3 passed (returns email+name for a validated partner with a linked account and drops null/empty emails; dedupes shared emails keeping the first name; empty query → `{ recipients: [] }`). Full unit suite 274 passed.

## Concerns for the reviewer

- Local docker was stopped. `yarn twenty docker:start` auto-upgraded the existing `twentycrm/twenty-app-dev:v2.31.0` container to `v2.34.0` because `engines.twenty` is `>=2.31.0`. Health timed out once during cron registration; the server became healthy after Nest finished booting. Apply then succeeded against that v2.34.0 instance. The app's `twenty-sdk` / `twenty-client-sdk` remain 2.31.0.
- Manifest builder inferred `inputSchema: [{ type: "object", properties: {} }]` from `_payload: unknown` and did not emit `outputSchema`. Task 3's Iterator consumes `recipients` from the step output; if the workflow editor needs an output schema to pick that array, Task 3 may need to set `outputSchema` or bind by name.
- Handler holds the GraphQL call plus filter/dedupe, matching the brief verbatim. App AGENTS.md prefers a thin logic-function over a service; not extracted.
- Apply also created `on-opportunity-listed` (Task 2) as a side effect of this apply. Checksums of 8 other logic functions changed in-place from the rebuild; no source edits there.
