# Timeline view, Phase 0 mockups

Review material for adding a first-class `TIMELINE` view type to Twenty (a horizontal time/gantt view like GitHub Projects' roadmap), following the `CALENDAR` view type as the architectural precedent. This directory is review-only and will be removed before implementation PRs land.

Open `timeline-view-mockups.html` in a browser (fully self-contained, Inter embedded from the repo's own `@fontsource/inter`). All colors, spacing, radii and type sizes are taken verbatim from `twenty-ui` light-theme tokens; the record index chrome (nav drawer, page card header, view bar, calendar-style toolbar) mirrors the real components.

UX semantics come from the gantt component twenty-eng validated in a sandboxed front component (`companion-shared.tsx` Timeline): one row per record with a bar from start to end date, quarter navigation, month gridlines, a vertical today line, bar color by record state (on-track green, at-risk amber, off-track red), dashed hollow bar for scheduled-but-not-started, diamond marker on completion, hover ring plus exact-dates tooltip, clickable record name column with related-count pills, and a legend footer.

## Variants

1. **Flat rows with zoom presets** (Month / Quarter / Year). Direct translation of the twenty-eng gantt. Bars clipped at the window edge get a square edge and overflow arrow. Single-date records render as a milestone diamond.
2. **Grouped lanes.** Collapsible groups via the record-group mechanism Kanban already uses (group by any SELECT field). Group headers reuse the board column Tag treatment; a collapsed group keeps a thin min-to-max summary span.
3. **Density, unscheduled bucket, empty state.** Compact 28px rows, view-bar filter/sort chips applying as in table/kanban, records missing either date collected in an "Unscheduled" section at the bottom with a ghost "Set dates" affordance, and a placeholder-style empty state.

## Comparison

| | 1. Flat rows | 2. Grouped lanes | 3. Density / unscheduled |
|---|---|---|---|
| Fidelity to twenty-eng UX | Exact match | Superset (no grouping there today) | Superset (undated records dropped silently there) |
| New mechanisms | Time-axis math, bar layer, zoom state | Everything from 1, plus record-group reuse and per-group collapse persistence | Everything from 1, plus a date-presence partition (plain selector) |
| Cost | Lowest | Highest (grouped virtualization) | Low, additive on 1 |
| Companion migration | Sufficient | Nice-to-have | Needed in practice |

## Recommendation

Ship v1 as Variant 1 plus the unscheduled bucket and density treatment of Variant 3 (they compose; the bucket is a partition of the same flat list). Zoom presets ship in v1 since the axis renderer needs windowing math anyway. Grouped lanes land as a fast-follow reusing Kanban's record-group state. Bar-drag date editing and color-by-select (twenty-eng's confidence field) stay in the Phase 4 stretch bucket.

## Phase 1 pointers (pending review)

- `packages/twenty-shared/src/types/ViewType.ts`: add `TIMELINE = 'TIMELINE'`
- View entity: `timelineStartFieldMetadataId` / `timelineEndFieldMetadataId` (SerializedRelation, indexed, nullable) with a CHECK constraint mirroring CALENDAR's; core migration; DTOs/inputs; validation that both fields are DATE or DATE_TIME on the view's object
- SDK: TIMELINE in the define ViewType and view manifest settings, universal-to-flat resolution for the two field references
- CALENDAR is not behind a feature flag today, so TIMELINE follows suit
