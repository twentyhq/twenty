# Plan: Replace the record-table hover **portal** with a pure-CSS `:hover` strategy

> **Status — in review.** The core migration is implemented in draft PR
> [twenty#21545](https://github.com/twentyhq/twenty/pull/21545) (+66 / −430, 19 files).
> The hovered portal and its mouse-tracking are gone; the edit button + outline are
> now pure CSS `:hover`; the focus and edit-mode portals are retained. Typecheck and
> `lint:diff-with-main` pass, and the change was verified live (hover affordance,
> first-column open-arrow, clean resting state, click→edit still works).
>
> **Done:** Phase 1 (CSS affordance), Phase 2 (cut hover wiring), Phase 4 (delete dead code), Phase 3 (focus-path confirmation, manually).
> **Left:** Phase 0 perf benchmark, UX sign-off on expand-on-focus, Phase 5 tests/Storybook/Argos, edit-mode hover suppression + outline z-index pass.
> See [§10 Status & what's left](#10-status--whats-left) for the detailed checklist.

## 1. Goal

Remove the React **portal that renders cell content on hover** in the record table and
replace the hover affordances (edit button, outline, background) with plain CSS `:hover`
on each cell.

The portal also re-renders certain fields as a **different component** on hover (expanded
chips, clickable links, etc.). CSS cannot swap component trees, so for those fields we
either keep the rich behaviour on **focus/click only**, or **simplify** them — as agreed.

---

## 2. How it works today

### 2.1 Three portals per cell

`RecordTableCellPortals` ([RecordTableCellPortals.tsx](packages/twenty-front/src/modules/object-record/record-table/record-table-cell/components/RecordTableCellPortals.tsx)) mounts **three** overlay portals, only ever one instance of each per table:

| Portal | Trigger state | Renders |
|---|---|---|
| **Hovered** (`RecordTableCellHoveredPortal`) | `recordTableHoverPositionComponentState` | focused `FieldDisplay` + **edit button** + outline |
| **Focused** (`RecordTableCellFocusedPortal`) | `recordTableFocusPositionComponentState` | focused `FieldDisplay` (keyboard/click nav) |
| **EditMode** (`RecordTableCellEditModePortal`) | focus active | the field input editor |

**This plan touches only the Hovered portal.** Focused + EditMode stay.

### 2.2 The hover portal lifecycle

1. A **single delegated `onMouseMove`** on the table body (`handleDelegatedMouseMove` in
   [RecordTableContent.tsx](packages/twenty-front/src/modules/object-record/record-table/components/RecordTableContent.tsx)) reads the hovered cell from `closest('[data-record-table-col]')`
   and writes `{column,row}` into `recordTableHoverPositionComponentState`. It early-returns
   when any cell is in edit mode.
2. `RecordTableCellHoveredPortal` ([file](packages/twenty-front/src/modules/object-record/record-table/record-table-cell/components/RecordTableCellHoveredPortal.tsx)) reads that state and, via
   `RecordTableCellPortalWrapper`, `createPortal`s its content **into the hovered cell's DOM
   node** (`#<cellId>` anchor on `RecordTableCellBaseContainer`).
3. `RecordTableCellHoveredPortalContent` ([file](packages/twenty-front/src/modules/object-record/record-table/record-table-cell/components/RecordTableCellHoveredPortalContent.tsx)) wraps the content in
   `FieldFocusStaticFocusedProvider` (so `useFieldFocus().isFocused === true`), renders
   `<FieldDisplay />` in display mode, **plus** `RecordTableCellEditButton`, with an
   interactive outline / pointer cursor.
4. The Focused portal also pushes mouse-move back into the hover state via
   `onMoveHoverToCurrentCell`, keeping the two in sync.

### 2.3 Why a portal instead of CSS? (the real reason)

**Performance.** Resting cells stay cheap: `RecordTableCellDisplayContainer` renders only a
truncated `FieldDisplay` (`overflow: hidden; white-space: nowrap`), **no edit button, no
hover handlers, no layout measurement**. The *rich/interactive* version is rendered for
**exactly one cell at a time** (the hovered one), by moving a single portal around. With a
virtualized grid of ~40 rows × ~15 columns this is a meaningful saving.

So any CSS replacement must preserve "resting cells are cheap" — i.e. it must **not** mount
the heavy/interactive variant in every cell.

### 2.4 What already uses CSS `:hover`

`RecordTableCellBaseContainer` ([file](packages/twenty-front/src/modules/object-record/record-table/record-table-cell/components/RecordTableCellBaseContainer.tsx)) already has a `&:hover` block — but it only
styles **read-only** cells (background/outline). Editable cells set everything to `unset`
and depend on the portal. This is the seam we extend.

---

## 3. The hard part: fields that render a *different component* on hover

On hover the content is wrapped in `FieldFocusStaticFocusedProvider`, so any field reading
`useFieldFocus()` renders its **focused** variant. These are the components that visibly
change between resting and hover:

| Field | Resting (cheap) | Hover/focused (rich) | Why CSS can't do it |
|---|---|---|---|
| **MultiSelect** ([MultiSelectFieldDisplay.tsx](packages/twenty-front/src/modules/object-record/record-field/ui/meta-types/display/components/MultiSelectFieldDisplay.tsx)) | `MultiSelectDisplay` (truncated chips) | `ExpandableList` (+N counter, floating dropdown) | `ExpandableList` measures each child's `offsetLeft` in a ref callback to compute overflow, and opens a floating-ui dropdown. Different tree + JS layout + click handlers. |
| **Relation (from-many)** ([RelationFromManyFieldDisplay.tsx](packages/twenty-front/src/modules/object-record/record-field/ui/meta-types/display/components/RelationFromManyFieldDisplay.tsx)) | plain `StyledContainer` of chips | `ExpandableList` | same as above |
| **Morph relation one-to-many** ([MorphRelationOneToManyFieldDisplay.tsx](packages/twenty-front/src/modules/object-record/record-field/ui/meta-types/display/components/MorphRelationOneToManyFieldDisplay.tsx)) | truncated | `ExpandableList` | same |
| **Phones** ([PhonesFieldDisplay.tsx](packages/twenty-front/src/modules/object-record/record-field/ui/meta-types/display/components/PhonesFieldDisplay.tsx) → [PhonesDisplay.tsx](packages/twenty-front/src/modules/ui/field/display/components/PhonesDisplay.tsx)) | first number, truncated | clickable links + chip count (`isFocused`) | adds anchors + click handlers |
| **Emails** ([EmailsDisplay.tsx](packages/twenty-front/src/modules/ui/field/display/components/EmailsDisplay.tsx)) | truncated | expanded + links (`isFocused`) | same |
| **Text (multi-row)** ([TextDisplay.tsx](packages/twenty-front/src/modules/ui/field/display/components/TextDisplay.tsx)) | 1 line, ellipsis | up to `displayedMaxRows` lines | borderline — *could* be CSS, see §5 |

`ExpandableList` is the crux. Mounting it in every cell to reveal via CSS would re-introduce
exactly the per-cell layout-measurement cost the portal was built to avoid. **CSS cannot
swap these trees**, so these fall under the "simplify" mandate.

---

## 4. Recommended approach

Split hover into **two layers** and treat them differently.

### Layer A — cheap affordances → **pure CSS** (the bulk of the win)

These are visual only and move to `&:hover` on `RecordTableCellBaseContainer`:

- **Outline / hover background / pointer cursor** — already there for read-only; extend to
  editable cells.
- **Edit button** (pencil / open-record arrow / secondary buttons) — render
  `RecordTableCellEditButton` **once per cell**, positioned `absolute; right: 0`, hidden by
  default (`opacity: 0; pointer-events: none`), revealed under `&:hover`. The button
  component is light (a few context reads) and renders no layout-measuring children, so one
  per visible cell is acceptable. Validate with the benchmark in §6.
- **Raise z-index on `:hover`** so the outline isn't clipped by neighbouring cells (today
  the portal's `z-index: TABLE_Z_INDEX.hoverPortal = 4` handled stacking).

### Layer B — component-swap fields → **move rich view to focus, or simplify**

The expanded/interactive variant (`ExpandableList`, links) is **no longer shown on hover**.
It is shown only when the cell is **focused** (clicked or keyboard-navigated), which is
still handled by the **Focused portal** — that portal already wraps content in
`FieldFocusStaticFocusedProvider`, so `isFocused` stays satisfied there.

Net behavioural change: **hovering a multiselect/relation/phones cell shows the truncated
display; you must click (focus) it to expand.** This is the simplification we agreed to.
No display component needs new code for this — they already branch on `isFocused`; we are
just removing the *hover* code path that set `isFocused = true` without a click.

**Decision needed (UX):** is "expand on focus/click only" acceptable for multiselect &
relations, or do we want a lightweight CSS-only tooltip/peek for a couple of them? Default
recommendation: ship focus-only, revisit if users miss hover-peek.

---

## 5. Optional CSS-only enhancements (nice-to-have)

Where the difference is *purely visual* we can keep a hover reveal in CSS:

- **Multi-row text**: on `&:hover` allow the cell to grow / show more rows via
  `white-space`, `-webkit-line-clamp`, or `overflow: visible` + raised z-index. Risk: a
  growing cell shifts row height or overlaps neighbours; needs an absolutely-positioned
  overlay layer to look right, which starts to resemble the portal. Treat as a follow-up,
  not part of the core removal.
- **"+N" chip counter**: if we precompute counts server/client-side we could show a static
  `+N` without `ExpandableList`'s measurement, expanding only on focus. Follow-up.

---

## 6. Performance validation (do this first)

Before deleting anything, **benchmark**. The portal exists for perf, so prove the CSS
version is at least neutral.

- Build a Storybook/perf story with a wide table (≥15 columns) and a tall virtualized
  viewport (~40–50 visible rows), mixing text, multiselect, relation, phones columns.
- Measure: scripting time on mouse-move across cells, DOM node count, and frame timing,
  before vs after.
- Expectation: CSS version **removes** the per-move atom write + portal re-render + global
  `onMouseMove` handler churn (likely snappier hover), at the cost of **one hidden edit
  button per visible cell** (static DOM). Net should be neutral-to-better *provided we do
  not mount `ExpandableList` per cell*.

If the per-cell edit button proves too heavy, fall back to a **single CSS-driven button
overlay** positioned via `:hover` + CSS custom properties, or render the button lazily on
first hover per row.

---

## 7. Implementation phases

**Phase 0 — Spike & benchmark (§6).** Gate the rest on results.

**Phase 1 — Add CSS hover affordances** to `RecordTableCellBaseContainer`:
- Extend `&:hover` to editable cells (outline, bg, cursor, `z-index`).
- Render `RecordTableCellEditButton` inside the cell, hidden, revealed on `&:hover`
  (respecting existing `showButton` logic: `isFieldInputOnly`, `isReadOnly`, `isFirstColumn`,
  mobile). Put it behind a feature flag so we can A/B against the portal.

**Phase 2 — Cut the hover portal wiring:**
- Remove `<RecordTableCellHoveredPortal />` from `RecordTableCellPortals`.
- Remove `handleDelegatedMouseMove` + `recordTableHoverPositionCallbackState` writes in
  `RecordTableContent`.
- Remove `onMoveHoverToCurrentCell` sync from `RecordTableCellFocusedPortalContent`
  ([file](packages/twenty-front/src/modules/object-record/record-table/record-table-cell/components/RecordTableCellFocusedPortalContent.tsx)) and the body-context callback.

**Phase 3 — Confirm focus path for component-swap fields.** Verify MultiSelect / Relation /
Phones / Emails still expand correctly when a cell is **focused** via the Focused portal
(they should, unchanged). Adjust any copy/empty states.

**Phase 4 — Delete dead code:**
- `RecordTableCellHoveredPortal.tsx`, `RecordTableCellHoveredPortalContent.tsx`
- `recordTableHoverPositionComponentState.ts`, `recordTableHoverPositionCallbackState`
- `useMoveHoverToCurrentCell.ts`
- the `isUnderHoveredPortal` short-circuit in `RecordTableCellFocusedPortal` (no longer needed).

**Phase 5 — Tests & visual:**
- Update/replace Storybook interaction tests that assert the hover portal DOM.
- Argos visual snapshots for: hover outline, edit-button reveal, first-column open arrow,
  read-only hover, mobile. (Note: animated/`framer-motion` stories need
  `MotionGlobalConfig.skipAnimations` — already handled globally.)
- `lint:diff-with-main` + `typecheck` for twenty-front.

---

## 8. Risks & call-outs

- **Behaviour change:** multiselect/relations/phones no longer expand on *hover*, only on
  *click/focus*. Needs sign-off (§4 decision).
- **Per-cell DOM growth:** one hidden edit button per visible cell. Mitigated by
  virtualization (only visible rows mount) and the §6 benchmark; fallback in §6.
- **Outline clipping / stacking:** must set `z-index` on `:hover` to replicate the portal's
  layering; watch sticky first column (`TABLE_Z_INDEX.cell.sticky = 8`).
- **Edit-mode suppression:** today hover is disabled while a cell edits (the mousemove
  early-returns). With CSS `:hover` we must suppress the hover affordance during edit mode
  too — e.g. a `data-editing` flag on the table that disables `:hover` styles, or
  `pointer-events` handling.
- **Out of scope (related):** the record **inline** cell (side panel / show page) uses a
  different `onMouseEnter/Leave → setIsFocused` mechanism
  ([RecordInlineCellContainer.tsx](packages/twenty-front/src/modules/object-record/record-inline-cell/components/RecordInlineCellContainer.tsx)). Not part of this change, but a candidate for the
  same CSS treatment later.

---

## 9. Files in scope (quick index)

**Remove / gut:**
- `record-table/record-table-cell/components/RecordTableCellHoveredPortal.tsx`
- `record-table/record-table-cell/components/RecordTableCellHoveredPortalContent.tsx`
- `record-table/states/recordTableHoverPositionComponentState.ts` (+ callback state)
- `record-table/record-table-cell/hooks/useMoveHoverToCurrentCell.ts`

**Edit:**
- `record-table/record-table-cell/components/RecordTableCellBaseContainer.tsx` (CSS hover + button)
- `record-table/record-table-cell/components/RecordTableCellPortals.tsx` (drop hovered portal)
- `record-table/components/RecordTableContent.tsx` (drop delegated mousemove)
- `record-table/record-table-cell/components/RecordTableCellFocusedPortal*.tsx` (drop hover sync)

**Verify unchanged (focus path still works):**
- `record-field/ui/meta-types/display/components/{MultiSelect,RelationFromMany,MorphRelationOneToMany,Phones}FieldDisplay.tsx`
- `ui/field/display/components/{PhonesDisplay,EmailsDisplay,TextDisplay}.tsx`
- `ui/layout/expandable-list/components/ExpandableList.tsx`

---

## 10. Status & what's left

Implemented in draft PR [twenty#21545](https://github.com/twentyhq/twenty/pull/21545).

### ✅ Done

- **CSS hover affordance** — `RecordTableCellBaseContainer` now reveals the edit /
  open-record button (`RecordTableCellEditButton`, absolutely positioned, hidden
  via `opacity:0; pointer-events:none`) and the interactive outline through a
  `&:hover` rule. The `showButton` / `showInteractiveStyle` logic (read-only,
  first column, input-only, mobile) was ported 1:1 from the old portal content.
- **Cut the hover portal wiring** — removed `<RecordTableCellHoveredPortal />`,
  the delegated `onMouseMove` / `onMouseLeave` + `recordTableHoverPositionCallbackState`
  writes in `RecordTableContent`, and the `onMoveHoverToCurrentCell` sync in
  `RecordTableCellFocusedPortalContent`.
- **Deleted dead code** — `RecordTableCellHoveredPortal(Content)`,
  `recordTableHoverPositionComponentState`, `useMoveHoverToCurrentCell` (+ test),
  the already-dead `useHandleContainerMouseEnter`, and `onMoveHoverToCurrentCell`
  from `RecordTableBodyContext` (+ both providers, the storybook decorator, and the
  perf story). Dropped the now-unused hover resets in `useLeaveTableFocus`,
  `useResetTableFocuses`, `useSetRecordTableData`.
- **Focus path confirmed (manual)** — multi-select/relation/phone fields still
  expand when a cell is focused via the retained focus portal; click→edit still
  opens the inline editor. Verified live with Playwright screenshots.
- **Quality gates** — `typecheck twenty-front` clean for touched files;
  `lint:diff-with-main twenty-front` 0/0 + formatting OK.

### 🔧 Deviations from the original plan

- **No feature flag.** Phase 1 suggested gating behind a flag for A/B; the change
  was small and self-contained, so it ships directly. Revisit if we want to A/B perf.
- **No `z-index` bump on `:hover`.** Relying on `outline-offset: -1px` to keep the
  outline inside the cell box (so neighbours don't clip it). Needs a visual pass,
  especially next to sticky columns (see below).
- **Hover button overlay uses a solid `background.primary`.** Clean on normal rows;
  on an *active/selected* row the strip behind the button can mismatch the row accent.
  Minor — left as polish (the old portal varied this by `isRecordTableRowActive`).

### ⏳ Left to do

- [ ] **Perf benchmark (Phase 0, gating).** The portal existed for perf. Measure a
  wide virtualized table (≥15 cols, ~40 visible rows): mouse-move scripting time,
  DOM node count, frame timing — before vs after. Only added static DOM is one hidden
  edit button per visible cell. Fallback if too heavy: single CSS-driven button overlay.
- [ ] **UX sign-off** on expand-on-focus (vs hover) for multi-select / relations /
  phones / emails. Default shipped: expand on click/focus only.
- [ ] **Edit-mode hover suppression.** The old `onMouseMove` early-returned while a
  cell was editing; CSS `:hover` doesn't. Add a `data-editing` flag (or
  `pointer-events`) on the table to disable the hover affordance during edit mode.
- [ ] **Outline stacking / clipping pass.** Confirm the `:hover` outline and button
  aren't clipped next to sticky first column (`TABLE_Z_INDEX.cell.sticky = 8`); add
  a hover `z-index` if needed.
- [ ] **Tests & visual (Phase 5).** Update/replace Storybook interaction tests that
  asserted the hover-portal DOM; add Argos snapshots for hover outline, edit-button
  reveal, first-column arrow, read-only hover, mobile.
- [ ] **Active-row button background** polish (see deviation above) — optional.
- [ ] Flip the PR out of **draft** once the benchmark + UX sign-off land.

### Out of scope (tracked, not in this PR)

- The record **inline** cell hover system (`RecordInlineCellContainer`, side panel /
  show page) uses a separate `onMouseEnter/Leave → setIsFocused` mechanism — a
  candidate for the same CSS treatment in a follow-up.
