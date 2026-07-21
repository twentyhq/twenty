# Loan-to-Value Ratio on Opportunity (+ Loan Amount relabel + Farm Property Value field)

## Context

Three connected changes to Opportunity: relabel "Amount" to "Loan Amount," add a "Farm Property Value" currency field, and add a computed "Loan-to-Value Ratio" percentage field. Originally planned as code changes to Opportunity's *standard* (built-in) field definitions — but that path exists for fields meant to ship to every Twenty workspace by default (it needs a `universalIdentifier`, an entry in the standard-object builder file, and a backfill command to reach already-existing workspaces). None of that applies here: this is one local dev workspace, and Twenty already has a zero-code path for exactly this — genuine custom fields, added via Settings, which take effect immediately in a single workspace with no code and no migration step.

**Revised approach: use Settings UI for everything that doesn't require actual logic. Write code only for the one thing that does — the LTV calculation.**

## What needs no code at all

Do these directly in the running app, in Settings > Data Model > Opportunity:

1. **Relabel "Amount" → "Loan Amount."** Open the `amount` field's settings and edit the label. Confirmed this works on standard fields, not just custom ones — only the internal API name (`amount`) is locked, not the label. Takes effect immediately.
2. **Add "Farm Property Value."** Add Field → Currency type, label "Farm Property Value." Immediately available on every Opportunity, filterable/sortable/addable to views like any other field — no backfill needed since custom fields are created directly in this workspace's own metadata, not synced out from code.
3. **Add "Loan-to-Value Ratio."** Add Field → Number type, with "Percentage" formatting and 2 decimal places, label "Loan-to-Value Ratio." Also set it non-editable in the field's settings (equivalent of `isUIEditable: false`) so it can't be typed into directly — same reasoning as before: this only blocks manual UI edits, not a direct API write, so the hook still needs to overwrite any client-supplied value rather than trust it.
4. **Add both new fields to whichever table/Kanban views and the record detail page you want them visible on** — normal view configuration in the UI, drag-and-drop, no code.

After creating the fields via the UI, check each field's settings panel for its exact internal API name (Twenty auto-generates this from the label, e.g. "Farm Property Value" → likely `farmPropertyValue`, "Loan-to-Value Ratio" → likely `loanToValueRatio`) — the hook below needs the exact names, not a guess.

## The one piece of actual code: the LTV calculation

Twenty has no "formula field" — no built-in way to say "this field = field A ÷ field B" — so a small backend hook is still needed to compute LTV whenever Loan Amount or Farm Property Value changes. This works the same way whether the fields are standard or custom: hooks read/write fields on a plain dynamic record object by name (`record['farmPropertyValue']`), not a typed class property, so nothing about these being custom fields makes this harder.

New module `packages/twenty-server/src/modules/opportunity/query-hooks/`, following the `actor/query-hooks/` pattern:
- One shared service (e.g. `OpportunityLoanToValueRatioService`) holding the calculation: `(loanAmountMicros / farmPropertyValueMicros) * 100`, rounded to 2 decimals, `null` if either value is missing or Farm Property Value is zero
- `opportunity-create-one.pre-query.hook.ts` and `opportunity-update-one.pre-query.hook.ts` — the two paths exercised by creating/editing an Opportunity by hand in the UI. `update-one` looks up the record's current Loan Amount/Farm Property Value first (an edit to just one of the two won't include the other in the payload), computes LTV, and injects it into the same payload about to be saved
- Registered as providers in a new `opportunity.module.ts` (this directory currently only has the entity type file — no existing module to add to)
- Bulk create/update (`createMany`/`updateMany`) intentionally not handled — out of scope for a single-record, single-workspace dev flow, not designed around
- **Must check the fields exist before touching them, per workspace.** The hook itself is global server code — registering `@WorkspaceQueryHook('opportunity.updateOne')` makes it run for *every* workspace on this server, not just the one where the fields were created. But `farmPropertyValue`/`loanToValueRatio` are workspace-scoped custom fields that currently only exist in the Apple workspace (confirmed this account also has a YCombinator workspace, which does not have them). Reading a missing field on a plain dynamic record just comes back `undefined`, which the existing null-handling already covers — but the hook must not unconditionally try to *write* `loanToValueRatio` back without first confirming that field exists for the workspace being processed, since writing to a column that doesn't exist there is the untested, risky path. Look up the workspace's field metadata (the same `fieldMetadataMaps`/object metadata mechanism used elsewhere in this codebase) and no-op entirely if either field is absent, rather than assuming every workspace looks like Apple.

Reference these three custom fields by their exact API names (confirmed from Settings after creating them) rather than adding typed properties to `opportunity.workspace-entity.ts` — that file only documents *standard* fields; custom fields don't need a compile-time declaration there.

## Risk assessment

- **The hook is the only real risk surface** — get the rounding and null-handling right (divide-by-zero, missing value), and make sure it actually overwrites any client-supplied `loanToValueRatio` rather than only filling it in when absent.
- **The hook runs server-wide, not just against the workspace these fields were added to.** Since the fields are workspace-scoped custom fields but the hook is global server code, editing an Opportunity in the YCombinator workspace (which has neither field) will also trigger this hook. Needs the field-existence check described above, or it risks erroring or misbehaving on a workspace that was never meant to have this feature.
- **Everything else is a UI action, immediately reversible** — deleting or editing a custom field back is also a zero-code Settings action if something needs correcting.

## Verification

1. `npx nx typecheck twenty-server`
2. `npx jest` on the calculation service and the two hooks: normal calculation, missing Farm Property Value, zero Farm Property Value → `null`
3. In Settings, confirm "Loan Amount" label shows correctly and "Farm Property Value"/"Loan-to-Value Ratio" exist with the right types
4. Open an Opportunity, confirm "Loan-to-Value Ratio" is visible but not editable by clicking into it
5. Manually enter a Farm Property Value for one Opportunity and confirm LTV recalculates correctly and matches a hand-computed expected value
6. Confirm both new fields appear wherever you added them (table/Kanban/detail page) and that filtering/sorting by either field works
7. Attempt a direct GraphQL mutation setting `loanToValueRatio` explicitly and confirm the saved value is the computed one, not the submitted one
8. Edit an Opportunity in the YCombinator workspace (which has neither custom field) and confirm the hook no-ops cleanly — no error, no crash, nothing written — rather than assuming every workspace looks like Apple
