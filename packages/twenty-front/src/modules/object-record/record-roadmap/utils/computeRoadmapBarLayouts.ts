import { type Temporal } from 'temporal-polyfill';

import {
  ROADMAP_BAR_HEIGHT,
  ROADMAP_BAR_VERTICAL_PADDING,
  ROADMAP_HEADER_HEIGHT,
  ROADMAP_ROW_HEIGHT,
  ROADMAP_SWIMLANE_HEADER_HEIGHT,
} from '@/object-record/record-roadmap/constants/RoadmapDimensions';
import { type RoadmapSwimlane } from '@/object-record/record-roadmap/hooks/useRecordRoadmapSwimlanes';
import { computeRoadmapBarPosition } from '@/object-record/record-roadmap/utils/computeRoadmapBarPosition';

export type RoadmapBarLayout = {
  leftPx: number;
  topPx: number;
  widthPx: number;
  heightPx: number;
};

type ComputeRoadmapBarLayoutsArgs = {
  swimlanes: RoadmapSwimlane[];
  viewportStart: Temporal.PlainDate;
  dayWidthPx: number;
};

// Walks the rendered swimlanes top-to-bottom and produces a flat
// `Map<recordId, layout>` of {leftPx, topPx, widthPx, heightPx} on the
// timeline canvas. The `topPx` is computed deterministically from the
// same constants used by the swimlane/row CSS, so the SVG overlay's
// arrows align with the actual bars without DOM measurement.
//
// Layout vertical accumulator:
//   ROADMAP_HEADER_HEIGHT (sticky top time header)
//   for each swimlane:
//     ROADMAP_SWIMLANE_HEADER_HEIGHT (the strip with group label/color)
//     for each row in swimlane:
//       ROADMAP_ROW_HEIGHT  ← bar lives at +ROADMAP_BAR_VERTICAL_PADDING
export const computeRoadmapBarLayouts = ({
  swimlanes,
  viewportStart,
  dayWidthPx,
}: ComputeRoadmapBarLayoutsArgs): Map<string, RoadmapBarLayout> => {
  const layouts = new Map<string, RoadmapBarLayout>();
  let cursorY = ROADMAP_HEADER_HEIGHT;

  for (const swimlane of swimlanes) {
    cursorY += ROADMAP_SWIMLANE_HEADER_HEIGHT;
    for (const placed of swimlane.records) {
      const { leftPx, widthPx } = computeRoadmapBarPosition({
        startDate: placed.startDate,
        endDate: placed.endDate,
        viewportStart,
        dayWidthPx,
      });
      layouts.set(placed.record.id, {
        leftPx,
        topPx: cursorY + ROADMAP_BAR_VERTICAL_PADDING,
        widthPx,
        heightPx: ROADMAP_BAR_HEIGHT,
      });
      cursorY += ROADMAP_ROW_HEIGHT;
    }
  }

  return layouts;
};
