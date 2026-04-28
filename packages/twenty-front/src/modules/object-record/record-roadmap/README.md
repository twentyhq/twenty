# Record Roadmap

Gantt-style timeline view for Twenty CRM. Renders records of any object that
has at least two DATE/DATE_TIME fields as draggable bars on a zoomable
horizontal timeline, with an optional SELECT-backed swimlane grouping and
an optional SELECT-backed color.

SPOTVISION fork — private, not contributed upstream. See `MERGE_NOTES.md` at
the repo root for the list of upstream files touched (and why) so future
rebases against `twentyhq/twenty` main stay tractable.

## At a glance

| Piece | Owner |
|---|---|
| View type enum `ROADMAP` | `twenty-shared/src/types/ViewType.ts` |
| Backend storage (8 columns) | `twenty-server/.../view/entities/view.entity.ts` |
| Validation / feature-flag gate | `twenty-server/.../view-tools.factory.ts`, `flat-view-validator.service.ts` |
| Feature flag | `IS_ROADMAP_VIEW_ENABLED` in `twenty-shared/.../FeatureFlagKey.ts` |
| Frontend render | This module |
| Options dropdown config | `object-options-dropdown/components/ObjectOptionsDropdownRoadmapFieldPickerContent.tsx` |
| View-picker create flow | `views/view-picker/components/ViewPickerContentCreateMode.tsx` (ROADMAP branch) |

## Data model

The `view` table carries eight roadmap-specific columns, all nullable so
non-ROADMAP views pay no cost:

| Column | Type | Purpose |
|---|---|---|
| `roadmapFieldStartId` | FK → `fieldMetadata` (ON DELETE CASCADE) | Required. DATE/DATE_TIME field read for bar left edge. |
| `roadmapFieldEndId` | FK → `fieldMetadata` (ON DELETE CASCADE) | Required. Must differ from start; bar right edge. |
| `roadmapFieldGroupId` | FK → `fieldMetadata` (ON DELETE CASCADE) | Optional. SELECT → swimlane buckets; RELATION → single read-only swimlane. |
| `roadmapFieldColorId` | FK → `fieldMetadata` (ON DELETE CASCADE) | Optional SELECT. Bars inherit the option's tag background/accent. |
| `roadmapFieldLabelId` | FK → `fieldMetadata` (ON DELETE CASCADE) | Optional. Overrides the label identifier in the sticky name column. |
| `roadmapDefaultZoom` | `view_roadmap_zoom_enum` | Default zoom when the view loads; enum has `DAY / WEEK / MONTH / QUARTER` though `DAY` is hidden in the UI. |
| `roadmapShowToday` | bool, default `true` | Toggles the vertical "Today" line. |
| `roadmapShowWeekends` | bool, default `true` | Toggles the weekend-column overlay. |
| `roadmapFieldPlannedEndId` | FK → `fieldMetadata` (ON DELETE SET NULL) | **Optional (Fase 6).** DATE/DATE_TIME field that powers the dashed "ghost" bar — when its value differs from the live `end`, the planned span is rendered behind the live one so slip is visible at a glance. |
| `roadmapFieldStatusId` | FK → `fieldMetadata` (ON DELETE SET NULL) | **Optional (Fase 6).** SELECT field used **only** for deviation logic. Records whose status is `DONE` or `CANCELLED` never show the red overdue border, even if today is past `end`. Does **not** paint the bar — that's still `roadmapFieldColorId`. |
| `roadmapFieldBlockedById` | FK → `fieldMetadata` (ON DELETE SET NULL) | **Optional (Fase 6).** SELECT field that drives the lock badge + tinted color when its value is anything other than `NONE`. Default mapping in `roadmapBlockedByColorMap.ts`: `CLIENT → orange`, `INTERNAL → red`, `EXTERNAL_VENDOR → purple`. |
| `roadmapShowDeviation` | bool, default `false` | **Optional (Fase 6).** Toggles the cumulative-slip "+Nd" pill badge in each swimlane header. The badge sums `deviationDays` across the swimlane's records using `useRecordRoadmapDeviation`. |

Integrity is enforced server-side by `CHK_VIEW_ROADMAP_INTEGRITY`:
`type != 'ROADMAP' OR (start IS NOT NULL AND end IS NOT NULL AND start != end)`.

## Rendering pipeline

```
RecordIndexRoadmapContainer
 ├─ RecordComponentInstanceContextsWrapper (reuses the shared filter/sort/field instance contexts)
 ├─ RecordRoadmapContextProvider           (injects objectMetadataItem + objectPermissions)
 ├─ RecordRoadmap                          (StyledRoot: flex column, 100% height)
 │   ├─ RecordRoadmapTopBar                (zoom selector + Go today + hidden-count indicator)
 │   └─ RecordRoadmapTimeline              (owns scroll, sliding-window state, interaction handlers)
 │       ├─ RecordRoadmapNameColumn        (sticky-left scroller, 260 px; vertical scroll synced from Timeline)
 │       └─ StyledTimelineCanvas           (overflow auto both)
 │           └─ StyledTimelineInner        (width = days.length * dayWidthPx)
 │               ├─ RecordRoadmapTimeHeader       (sticky top)
 │               ├─ RecordRoadmapWeekendsOverlay  (absolute)
 │               ├─ RecordRoadmapSwimlane[]       (each wraps Rows; tags [data-roadmap-swimlane-key])
 │               │   └─ RecordRoadmapRow[]        (fixed 40 px, border-box)
 │               │       └─ RecordRoadmapBar     (absolute; pointer-capture drag/resize)
 │               └─ RecordRoadmapTodayLine        (absolute, sticky top line)
 ├─ RecordRoadmapSSESubscribeEffect         (listens to record-store SSE and invalidates Apollo cache)
 └─ RecordIndexRoadmapDataLoaderEffect      (populates recordIds + hiddenCount atoms for the TopBar)
```

## Positioning math

`renderedDaysStart` is the single anchor: every positioned child (header
bands, day cells, weekend columns, bars, today line) is laid out as
`(date - renderedDaysStart) * dayWidthPx`. The `viewportStart` atom is a
*user-facing* anchor (today button / auto-fit targets) and drives the
current `renderedDaysStart = viewportStart - daysBefore`.

### Sliding window (the "infinite" scroll)

- `daysBefore` and `daysAfter` start at `INITIAL_BUFFER_DAYS = 365`.
- `totalDays = daysBefore + viewportWidthDays + daysAfter`.
- `handleCanvasScroll` extends the window by `BUFFER_EXTENSION_DAYS = 180`
  on whichever side reaches the `EDGE_EXTEND_THRESHOLD_PX = 400` band.
- A `useLayoutEffect` watches `daysBefore` and adds `delta * dayWidthPx` to
  `scrollLeft` whenever it grows — otherwise prepending days would shunt
  the content right and the user would see a visual jump.
- Another `useLayoutEffect` watches the user anchor: whenever
  `viewportStart` changes (Go today, auto-fit, zoom change re-fit), the
  window resets symmetrically and `scrollLeft` snaps to
  `INITIAL_BUFFER_DAYS * dayWidthPx`.

### Two-scroller layout

Name column and timeline each own their scroll region:

- `StyledNameColumnScroller` (`overflow: hidden`) — the name column never
  receives a scrollbar; user scroll is consumed by the timeline canvas.
- `StyledTimelineCanvas` (`overflow: auto` on both axes) — horizontal scroll
  belongs to it exclusively. On every scroll event we mirror `scrollTop`
  onto the name-column scroller. This is cheaper and more reliable than
  trying to `position: sticky; left: 0` inside a horizontally-scrolling
  container (flex/grid quirks bit us once).

### Row/column pixel alignment

Every row on both sides uses `box-sizing: border-box` and the same
`ROADMAP_ROW_HEIGHT` / `ROADMAP_SWIMLANE_HEADER_HEIGHT` / `ROADMAP_HEADER_HEIGHT`
constants. Skipping `border-box` leaks the 1 px bottom border into the
layout and the two panes drift by 1 px per row after a few dozen rows.

## Interactions

| Gesture | Location | Hook | Behavior |
|---|---|---|---|
| Drag bar body | `RecordRoadmapBar` | `useRecordRoadmapBarInteraction` | Moves both dates by the rounded day delta. Optimistic Apollo cache + snackbar on failure (see `useRecordRoadmapUpdateDates`). |
| Drag resize handle | `RecordRoadmapBar` | `useRecordRoadmapBarInteraction` | Moves start or end only. Same commit path. |
| Drag bar body vertically | `RecordRoadmapBar` | `useRecordRoadmapBarInteraction` + `findSwimlaneKeyAtPoint` | When dropped in a different swimlane and the group field is SELECT, the mutation also updates `groupFieldName` in the same call. RELATION grouping is deliberately read-only. |
| Click bar | `RecordRoadmapBar` | `useRecordRoadmapBarInteraction#onClick` | Fires on pointerup when `finalDelta === 0 && mode === 'move'` (no drag, not a resize grab). Opens the record via `useOpenRecordFromIndexView`. |
| Click name row | `RecordRoadmapNameColumn` | Native `onClick` | Same record-open hook. |
| Double-click empty canvas | `RecordRoadmapSwimlane` | `useRecordRoadmapCreateOnDoubleClick` | Creates a record spanning 3 days starting at the clicked day, pre-fills the swimlane's group value, navigates to the new record. Disabled when read-only. |
| Ctrl / Cmd + wheel | `RecordRoadmapTimeline` | `useRecordRoadmapWheelZoom` | Steps through Week ↔ Month ↔ Quarter; triggers the zoom-change re-fit. |

### Read-only

`objectPermissions.canUpdateObjectRecords === false` flips a `readOnly`
flag on the Timeline. The bar drops its pointer handlers (hiding resize
handles), the canvas stops wiring the dbl-click handler, and the bar
falls back to a plain `onClick`. Click-to-open on name rows stays wired.

## Color

`RecordRoadmapBar.getColorTokensFor(color)` maps the SELECT option's color
name (e.g. `'blue'`) to `themeCssVariables.tag.background.blue` and
`tag.text.blue`. These are the exact tokens Chips/Tags use elsewhere, so
the palette is consistent and dark-mode-safe without a new mapping.

## State

Per-view atoms (all `createAtomState` / `createAtomComponentState`):

- `recordRoadmapZoomComponentState` (per view instance) — hydrated from `view.roadmapDefaultZoom`.
- `recordRoadmapViewportStartComponentState` — user anchor.
- `recordRoadmapRecordIdsComponentState` + `recordRoadmapHiddenRecordCountComponentState` — computed in `RecordIndexRoadmapDataLoaderEffect`.
- `recordIndexRoadmapFieldStartIdState` / `FieldEndIdState` / `FieldGroupIdState` / `FieldColorIdState` / `FieldLabelIdState` / `ShowTodayState` / `ShowWeekendsState` / `DefaultZoomState` — populated by `useLoadRecordIndexStates` from `view.roadmap*`.

## Performance

No virtualization yet. For ≤ 500 records × ~4 years of days this is fine on
dev hardware; Fase 5 of the PRD defines the formal budget (≤ 2 s p95 first
paint, 60 fps sustained during drag). When the limit gets pushed, the
lowest-hanging fruit is horizontal windowing of the rendered day cells
(the weekend overlay and time-header iterate over the full `days` array).

## Testing

- Unit/component: `__stories__/*.stories.tsx` for critical components (WIP).
- e2e: `packages/twenty-e2e-testing/tests/roadmap-view/` — happy-path smoke
  test (create view, zoom selector, Go today). Drag/resize/dblclick scenarios
  need CDP pointer scripting and are out of scope for the smoke test.

## Extending

Adding a new field role (e.g. an assignee filter):

1. Add the column to `view.entity.ts` + an INSTANCE migration.
2. Extend `ViewDTO`, `CreateViewInput`, `UpdateViewInput`, and the GraphQL
   query fragments (`viewFragment.ts`). Regenerate GraphQL types.
3. Wire universal identifier resolution in `fromViewEntityToFlatView` and
   `fromCreateViewInputToFlatViewToCreate`.
4. Add a `recordIndexRoadmapField…IdState` atom + `useLoadRecordIndexStates` hydration.
5. Read it in `RecordRoadmapTimeline` → `useRecordRoadmapFetchRecords` (add to `roadmapFieldIds` so the GQL selection set includes it).
6. Add a sub-page to `ObjectOptionsDropdownRoadmapFieldPickerContent` (or a dedicated picker) and wire a new entry in `ObjectOptionsDropdownLayoutContent`.

When in doubt, follow the `roadmapFieldColorId` chain end-to-end — it's the
canonical field role and was intentionally made to mirror `roadmapFieldGroupId`.

## Fase 6 deviation indicators

The Fase 6 roles (`PlannedEnd` / `Status` / `BlockedBy` / `ShowDeviation`)
were added in lockstep using the same chain. The first real consumer is
`OpportunityMilestone` (a SPOTVISION-owned standard object): its TABLE
view ships from the standard application; the Roadmap view is created
on-demand from the view picker once the user has at least two DATE fields
to use as start/end. A future follow-up will extend
`createStandardViewFlatMetadata` to resolve the new roadmap field names
to IDs so the Roadmap view can ship pre-configured too.
