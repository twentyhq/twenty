# RecordTable Performance Improvement Plan

## Current State (Audit Findings)

### Component Depth: 31 components from table root to displayed text

For a table with 50 visible rows × 8 columns = **400 cells**, that's **12,400+ component instances**.

**Per-cell render path (14 components from CellWrapper to text):**

```
RecordTableCellWrapper              → context + useMemo
  RecordTableCellFieldContextWrapper  → 2 context reads + instance ID compute
    RecordTableCellFieldContextGeneric  → 5 hooks (3 contexts, useObjectMetadataItems, permissions)
      RecordTableCellStyleWrapper       → useContext(ThemeContext) + styled div
        RecordTableCell                 → pass-through
          FieldFocusContextProvider     → useState PER CELL (!)
            RecordTableCellContainer    → pass-through
              RecordTableCellBaseContainer → 6 hooks (3 contexts, focus, openCell, theme)
                RecordTableCellDisplayMode   → 4 hooks (context, body ctx, openCell, inputOnly)
                  RecordTableCellDisplayContainer → styled divs
                    FieldDisplay                  → useContext + field type branching
                      TextFieldDisplay            → useRecordFieldValue (Jotai atom)
                        TextDisplay               → styled div
                          OverflowingTextWithTooltip → 2× useState
```

### Key Issues Found

| Issue | Impact | Details |
|-------|--------|---------|
| `FieldFocusContextProvider` creates `useState` per cell | HIGH | 400 state instances, only used on hover |
| `RecordTableCellFieldContextGeneric` calls `useObjectMetadataItems()` per cell | HIGH | Reads full global metadata list 400× |
| `useOpenRecordTableCellFromCell` called in 2 components per cell | HIGH | Redundant 3-context reads × 2 |
| No `React.memo` anywhere in cell path | HIGH | Every parent re-render cascades unconditionally |
| `RecordTableTr` subscribes to NEXT row's state | MEDIUM | 3 extra atom reads per row for border styling |
| Display + interaction logic mixed in every cell | MEDIUM | Event handlers, closures created for ALL cells |
| 4 styled wrapper divs per cell | MEDIUM | DOM depth + class computation overhead |
| Emotion used for `RecordTableRowDiv` (runtime CSS-in-JS) | MEDIUM | Dynamic theme interpolation per row |
| `FieldContext.Provider` creates new object every render | MEDIUM | Forces all children to re-render |
| `Draggable` wrapper per row | LOWER | DnD overhead even when not dragging |
| `OverflowingTextWithTooltip` has 2× useState | LOWER | Tooltip state per text cell |

## Changes Made

### Tooling & Infrastructure

- **Render profiler** (`useRecordTableRenderProfiler.ts`): Custom hook that logs per-component render counts, total/avg/max render times. Enable via `window.__RECORD_TABLE_PROFILE = true`. Instrumented on `RecordTableTr`, `RecordTableFieldsCells`, `RecordTableCellFieldContextGeneric`, `RecordTableCellBaseContainer`, `RecordTableCellDisplayMode`.
- **Cell render benchmark** (`RecordTableCellPerformanceAudit.tsx`): Renders 400 cells at various complexity levels (minimal div, styled div, with context, with hooks, full replica) and measures mount time. Uses inline styles since Linaria requires build-time processing.
- **State access benchmark** (`RecordTableStateAccessAudit.tsx`): Compares React context reads vs Jotai atom reads vs pre-resolved values across 400 cells.
- **Perf page** (`RecordTablePerfPage.tsx`): Standalone page at `/__perf__/table`, routed outside `AppRouterProviders` to bypass auth/metadata providers entirely.
- **Perf overlay** (`RecordTablePerfOverlay.tsx`): Mountable inside any authenticated page. Toggle with `Ctrl+Shift+P` or `window.__SHOW_TABLE_PERF = true`.

### Phase 1 Progress (Display/Interaction Split)

**1a. Removed `FieldFocusContextProvider` from display path** (DONE)
- `RecordTableCell` now wraps cells in `FieldFocusStaticUnfocusedProvider` (a static context with `isFocused: false`, no `useState`).
- `RecordTableCellHoveredPortalContent` wraps hovered cell content in `FieldFocusStaticFocusedProvider` (static `isFocused: true`).
- Eliminates 400 `useState` instances from the display path.

**1b. Event delegation for onMouseMove** (DONE)
- Removed `onMouseMove` and `onMouseLeave` from each `RecordTableCellBaseContainer`.
- Added a single delegated `onMouseMove` on `RecordTableContent` that parses cell position from `id="record-table-cell-{col}-{row}"` via `event.target.closest`.
- Uses `lastHoverPositionRef` to skip redundant updates when mouse stays in the same cell.
- Eliminates 400 closure creations for mouse handlers.

**1b (continued). Removed unused hooks from `RecordTableCellBaseContainer`** (DONE)
- Removed `useFieldFocus` (no longer needed since focus is static context).
- Removed `useRecordTableBodyContextOrThrow` (mouse handlers were the only consumer).
- Removed `handleContainerMouseMove` and `onMouseLeave` handlers.

### Phase 3 Progress (State Optimization)

**3a. Hoisted `useObjectMetadataItems()` out of cell loop** (DONE)
- Added `objectMetadataItems` to `RecordTableContext` type and `RecordTableContextProvider`.
- `RecordTableCellFieldContextGeneric` now reads `objectMetadataItems` from the table context instead of calling `useObjectMetadataItems()` per cell.
- Eliminates 400 per-cell reads of the global metadata atom.
- Updated `RecordTableDecorator.tsx` and `RecordTableCell.perf.stories.tsx` to satisfy the new context type.

## Improvement Plan

### Phase 1: Separate Display from Interaction (HIGH IMPACT)

**Goal:** The display path should ONLY display. Interaction (hover, focus, edit) is handled by portals and event delegation.

**1a. Remove `FieldFocusContextProvider` from display path** ✅
- Replaced with static context providers. Eliminates 400 `useState` instances.

**1b. Make `RecordTableCellBaseContainer` display-only** ✅ (partial)
- `onMouseMove` and `onMouseLeave` removed, delegated to table level. ✅
- `onClick` handler still present — needs event delegation or portal handling. TODO.

**1c. Make `RecordTableCellDisplayMode` display-only**
- Remove `useOpenRecordTableCellFromCell` and `useIsFieldInputOnly`.
- Click-to-edit handled by event delegation or portals.
- Eliminates 4 hook calls per cell.

**1d. Lazy tooltip in `OverflowingTextWithTooltip`**
- Replace per-cell `useState` with CSS `:hover` + a single shared tooltip portal.
- Eliminates 400 × 2 `useState` instances.

### Phase 2: Flatten Component Hierarchy

**Goal:** Reduce from 14 components per cell to ~5-6.

**2a. Merge cell container chain**
Merge `RecordTableCellContainer` + `RecordTableCellBaseContainer` + `RecordTableCellDisplayMode` + `RecordTableCellDisplayContainer` into a single `RecordTableCellDisplay` component.
- Currently 4 components → 1.

**2b. Merge cell context chain**
Merge `RecordTableCellWrapper` + `RecordTableCellFieldContextWrapper` + `RecordTableCellFieldContextGeneric` into a single `RecordTableCellContextSetup` that provides all cell-level context.
- Currently 3 components → 1.

**2c. Remove `RecordTableCell` as pass-through**
After Phase 1 removes `FieldFocusContextProvider`, `RecordTableCell` just renders `RecordTableCellContainer`. Inline it.

**Target structure per cell:**
```
RecordTableCellContextSetup       → all contexts in one place
  RecordTableCellDisplay          → single styled div, display-only
    FieldDisplay                  → field type branching
      TextFieldDisplay            → data read + render
```

### Phase 3: Optimize State Access

**Goal:** Reduce per-cell computation, eliminate unnecessary atom reads.

**3a. Hoist `useObjectMetadataItems()` out of cell loop** ✅
- Moved to `RecordTableContextProvider`, read from table context in cells.

**3b. Pre-compute `fieldDefinition` and permissions at table level**
- `fieldDefinitionByFieldMetadataItemId[recordField.fieldMetadataItemId]` lookups are stable per render.
- Permission computation (including junction config) should be done once per field, not per cell.
- Compute a `Map<fieldMetadataItemId, { fieldDefinition, isReadOnly, isForbidden }>` at the `RecordTableFieldsCells` level.

**3c. Reduce `RecordTableTr` atom subscriptions**
- Stop subscribing to next-row state (`focusIndex + 1`). Use CSS adjacent sibling selectors for border styling.
- Eliminates 3 atom reads per row (150 total for 50 rows).

**3d. Move `isRecordReadOnly` out of `RecordTableTr`**
- If permissions are per-object, compute once at table level.

### Phase 4: CSS-only Interactions

**Goal:** Move hover/focus/active styling entirely to CSS, removing React state from the hot path.

**4a. Replace hover portals with CSS `:hover`**
- The `recordTableHoverPositionComponentState` → portal approach can be replaced with CSS on the cell div.
- The portal overlay (buttons, etc.) can be triggered by CSS `:hover` on the row/cell.

**4b. Convert `RecordTableRowDiv` from Emotion to Linaria or plain CSS**
- The `data-focused` / `data-active` data attribute pattern is already in place.
- Extend for all interactive states, removing runtime CSS-in-JS.

**4c. Replace theme prop passing with CSS custom properties**
- Set `--cell-bg`, `--cell-border`, `--cell-color` at the table root via ThemeContext.
- Reference them in static CSS instead of reading theme per component and passing as props.
- Eliminates per-cell theme context reads and dynamic styled-component props.

### Phase 5: Structural Improvements

**5a. Event delegation at table body level**
- Single `onMouseMove`, `onClick`, `onContextMenu` handler on table body.
- Dispatch based on `data-cell-position` and `data-record-id` attributes.
- Eliminates 1200+ event handler registrations.

**5b. Lazy `Draggable` wrapper**
- Only wrap rows with `@hello-pangea/dnd` `Draggable` when drag mode is active.
- Or switch to a lighter drag implementation that doesn't wrap every row.

**5c. Stabilize context values**
- Ensure `FieldContext.Provider`, `RecordTableRowContextProvider` values are stable references.
- React Compiler should help here, but explicit stable references via extraction are safer.

## Measurement Tools

### Render Profiler
Already instrumented on key components. Enable in browser DevTools:
```js
window.__RECORD_TABLE_PROFILE = true
```
Results batch-log every 2s showing per-component render counts, total/avg/max times.

### POC Benchmarks
Available at `/__perf__/table` when dev server is running:
- **Cell Render Benchmark**: Compares minimal cell vs various complexity levels (400 cells)
- **State Access Benchmark**: Compares context vs Jotai atoms vs pre-resolved values

## Expected Impact

| Phase | Effort | Impact on Initial Render | Impact on Interactions |
|-------|--------|-------------------------|----------------------|
| Phase 1: Display/Interaction split | 3-5 days | ~40-50% fewer hooks/cell | Major: hover doesn't touch React |
| Phase 2: Flatten hierarchy | 3-5 days | ~60% fewer components/cell | Faster re-renders |
| Phase 3: State optimization | 2-3 days | Faster cell init | Fewer atom subscriptions |
| Phase 4: CSS-only interactions | 3-5 days | Slight (fewer atoms) | Major: CSS-only hover/focus |
| Phase 5: Structural | 5-7 days | Fewer event handlers | Lighter DnD, delegation |

## Recommended Execution Order

1. **Phase 1** (highest ROI) → separate display from interaction
2. **Phase 3a/3b** (quick, safe) → hoist computation out of cell loop
3. **Phase 2** (compounds with Phase 1) → flatten hierarchy
4. **Phase 4** → CSS-only interactions
5. **Phase 5** → structural improvements
