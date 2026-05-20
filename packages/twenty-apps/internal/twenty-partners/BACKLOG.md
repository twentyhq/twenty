# Backlog

## Partner Record Page Layout

The SDK's `RECORD_TABLE` widget has no `relatedObjectId` / relation-scoping parameter — it cannot auto-scope to the current record's linked records. The custom `RECORD_PAGE` page layout was removed because it replaced the native relation tabs with empty widgets.

**When the SDK supports relation-scoped RECORD_TABLE (or an equivalent widget):**
- Re-introduce `src/page-layouts/partner-record-page.page-layout.ts`
- Profile tab: `FIELDS` widget (partner fields in curated order)
- Opportunities tab: `RECORD_TABLE` scoped to opportunities linked to this partner
- Persons tab: `RECORD_TABLE` scoped to persons linked to this partner

---

## Opportunities View — Column Visibility

The custom "Opportunities" view (`src/views/all-opportunities.view.ts`) sets `isVisible: false` / `isVisible: true` but the `createdBy` column ordering is not working as expected in the UI. The native Twenty Opportunities view column order cannot be overridden from app code.

**To fix:**
- Investigate whether a `defaultVisible` flag or view position override is available in a newer SDK version
- Or scope the view as the object's default view so it fully replaces the native one

---

## Matches Overview — Kanban via Code

`ViewType.KANBAN` with `mainGroupByFieldMetadataUniversalIdentifier` works in the Twenty UI but cannot be configured via app code. When set in `src/views/matches-overview.view.ts`, the view either falls back to TABLE or the groupBy is ignored at sync time.

**To investigate:**
- Whether the SDK's `defineView` supports `ViewType.KANBAN` + `mainGroupByFieldMetadataUniversalIdentifier` in the current version
- Whether there is a separate `ViewKey` or kanban-specific configuration required
- Workaround in the meantime: set the Kanban grouping manually in the UI on the Matches Overview view

---

## App Description and Field Descriptions

The Twenty "About" section (app description) and individual field descriptions are currently empty or minimal.

**To add:**
- `APPLICATION_MANIFEST` or `defineApplication` description field — write a clear one-liner about what twenty-partners does
- Partner object field descriptions: `slug`, `status`, `availability`, `deploymentExpertise`, `servedGeos`, `languagesSpoken`, `calendlyLink`, `introduction`, `lastMatchAt`
- Opportunity extension field descriptions: `matchStatus`, `designDocStatus`, `introSentAt`, `lastRelanceSentAt`, `tftId`
- Roles: add a help URL or tooltip text once the SDK exposes it

---

## Manual-Match Modal

- **Manual-match modal**: Front Component widget on the opportunity record page that opens a partner picker (lists `ACTIVE`+`AVAILABLE` partners via `list-available-partners`). On selection, calls a logic function that assigns the partner, flips `matchStatus` to `MATCHED`, and triggers the same post-match side-effects as the auto-match path (audit Note, `lastMatchAt` bump, future email send). Goal: parity between auto and manual paths.
