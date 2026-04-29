import { themeCssVariables } from 'twenty-ui/theme-constants';

import { ROADMAP_CONNECTION_DOT_DIAMETER } from '@/object-record/record-roadmap/constants/RoadmapDimensions';
import { type RoadmapDependency } from '@/object-record/record-roadmap/hooks/useRecordRoadmapDependencies';
import { type RoadmapBarLayout } from '@/object-record/record-roadmap/utils/computeRoadmapBarLayouts';

type RecordRoadmapDependencyConnectorsProps = {
  dependencies: RoadmapDependency[];
  barLayouts: Map<string, RoadmapBarLayout>;
  canvasWidthPx: number;
  canvasHeightPx: number;
};

// Distance of the elbow the connector takes off horizontally before
// dropping vertically. Keeps the line readable when the dependent bar
// starts directly under the required one.
const HORIZONTAL_OFFSET_PX = 12;

// Half the dot diameter — the path stops `radius` px short of the bar
// edge on each side so the arrowhead lands on the dot's outer edge
// instead of being hidden behind it.
const DOT_RADIUS_PX = ROADMAP_CONNECTION_DOT_DIAMETER / 2;

// SVG overlay that draws elbow-style arrows from each `requiredMilestone`
// bar's right edge to its dependent `dependentMilestone` bar's left
// edge. Pointer events are disabled so the arrows never interfere with
// drag/click on the underlying bars. The path is dashed and the marker
// is a triangle; both inherit `currentColor` so a single CSS variable
// drives the whole overlay.
export const RecordRoadmapDependencyConnectors = ({
  dependencies,
  barLayouts,
  canvasWidthPx,
  canvasHeightPx,
}: RecordRoadmapDependencyConnectorsProps) => {
  if (dependencies.length === 0) {
    return null;
  }

  const stroke = themeCssVariables.font.color.tertiary;

  return (
    <svg
      aria-hidden
      style={{
        height: canvasHeightPx,
        left: 0,
        pointerEvents: 'none',
        position: 'absolute',
        top: 0,
        width: canvasWidthPx,
        zIndex: 2,
      }}
    >
      <defs>
        <marker
          id="record-roadmap-dependency-arrow"
          markerHeight="6"
          markerWidth="6"
          orient="auto-start-reverse"
          refX="5"
          refY="3"
          viewBox="0 0 6 6"
        >
          <path d="M 0 0 L 6 3 L 0 6 Z" fill={stroke} />
        </marker>
      </defs>
      {dependencies.map((dependency) => {
        const required = barLayouts.get(dependency.requiredMilestoneId);
        const dependent = barLayouts.get(dependency.dependentMilestoneId);
        if (required === undefined || dependent === undefined) {
          return null;
        }

        // Start at the OUTER edge of the required-bar's end dot and end
        // at the OUTER edge of the dependent-bar's start dot, so the
        // arrowhead visually lands on the port instead of being eaten
        // by the dot's fill.
        const fromX = required.leftPx + required.widthPx + DOT_RADIUS_PX;
        const fromY = required.topPx + required.heightPx / 2;
        const toX = dependent.leftPx - DOT_RADIUS_PX;
        const toY = dependent.topPx + dependent.heightPx / 2;

        // Two-segment elbow path: horizontal-then-vertical-then-horizontal.
        // Avoids overlapping the bars themselves and reads cleanly at most
        // zoom levels.
        const elbowX = Math.max(fromX + HORIZONTAL_OFFSET_PX, toX - HORIZONTAL_OFFSET_PX);
        const path = `M ${fromX} ${fromY} L ${elbowX} ${fromY} L ${elbowX} ${toY} L ${toX} ${toY}`;

        return (
          <path
            key={dependency.id}
            d={path}
            fill="none"
            stroke={stroke}
            strokeDasharray="4 3"
            strokeWidth={1.5}
            markerEnd="url(#record-roadmap-dependency-arrow)"
          />
        );
      })}
    </svg>
  );
};
