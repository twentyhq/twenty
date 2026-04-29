import { useState } from 'react';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { ROADMAP_CONNECTION_DOT_DIAMETER } from '@/object-record/record-roadmap/constants/RoadmapDimensions';
import { type RoadmapDependency } from '@/object-record/record-roadmap/hooks/useRecordRoadmapDependencies';
import { type RoadmapBarLayout } from '@/object-record/record-roadmap/utils/computeRoadmapBarLayouts';

export type DependencyClickPayload = {
  dependency: RoadmapDependency;
  /** Where to anchor a popover — midpoint of the elbow path in inner-
      canvas pixels. */
  anchorXPx: number;
  anchorYPx: number;
};

type RecordRoadmapDependencyConnectorsProps = {
  dependencies: RoadmapDependency[];
  barLayouts: Map<string, RoadmapBarLayout>;
  canvasWidthPx: number;
  canvasHeightPx: number;
  /** Fires when a user clicks an arrow. The Timeline opens a popover
      anchored at the arrow's elbow point so it doesn't cover either
      milestone. */
  onDependencyClick?: (payload: DependencyClickPayload) => void;
};

// Minimum control-point offset for the cubic Bézier curve. Even when the
// two ports are vertically aligned and horizontally adjacent, we want a
// gentle arc rather than a straight line — gives the eye something to
// follow and visually separates a same-row dependency from the bar
// outline. 24px reads as a clear curve at every zoom level we ship.
const MIN_CONTROL_OFFSET_PX = 24;

// Half the dot diameter — the path stops `radius` px short of the bar
// edge on each side so the arrowhead lands on the dot's outer edge
// instead of being hidden behind it.
const DOT_RADIUS_PX = ROADMAP_CONNECTION_DOT_DIAMETER / 2;

// Width of the invisible hit-area path drawn under each visible arrow.
// Lets the user click anywhere within ~6px of the line instead of having
// to land exactly on the 1.5px stroke. Also acts as the hover surface so
// the visible path can stay thin for visual cleanliness.
const HIT_AREA_STROKE_WIDTH_PX = 14;

// SVG overlay that draws elbow-style arrows from each `requiredMilestone`
// bar's right edge to its dependent `dependentMilestone` bar's left
// edge. The wrapping `<svg>` has pointer-events disabled so empty space
// passes clicks through to the bars/canvas; only the per-arrow `<path>`
// elements opt in via `pointer-events: stroke` on the hit-area path.
// The path is dashed and the marker is a triangle; both inherit
// `currentColor` so a single CSS variable drives the whole overlay.
export const RecordRoadmapDependencyConnectors = ({
  dependencies,
  barLayouts,
  canvasWidthPx,
  canvasHeightPx,
  onDependencyClick,
}: RecordRoadmapDependencyConnectorsProps) => {
  // Track which arrow the cursor is over to drive the visual highlight.
  // SVG `:hover` works for static color, but we want a thicker stroke
  // and brighter token while the popover trigger is also clickable —
  // an explicit state keeps both effects in sync without `!important`
  // tricks.
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  if (dependencies.length === 0) {
    return null;
  }

  // Dependency arrows are intentionally red so the dependency overlay
  // reads as a critical-path/blocking signal at a glance, even when the
  // bar palette underneath uses similar neutrals. We use `tag.text.red`
  // (the saturated badge red) instead of `border.color.danger` (a pale
  // pink) — the latter washes out against the canvas background. Hover
  // stays on the same token but bumps stroke width via inline props.
  const stroke = themeCssVariables.tag.text.red;
  const hoverStroke = themeCssVariables.tag.text.red;

  return (
    <svg
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
        <marker
          id="record-roadmap-dependency-arrow-hover"
          markerHeight="6"
          markerWidth="6"
          orient="auto-start-reverse"
          refX="5"
          refY="3"
          viewBox="0 0 6 6"
        >
          <path d="M 0 0 L 6 3 L 0 6 Z" fill={hoverStroke} />
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

        // Smooth horizontal cubic Bézier: control points pushed to the
        // sides scale with the horizontal distance so far-apart bars get
        // a long relaxed swoop and close-by bars get a tight arc — never
        // the squeezed elbow that crashes into the dependent bar's left
        // edge when the two milestones sit close together. The minimum
        // floor (`MIN_CONTROL_OFFSET_PX`) keeps a visible curve even when
        // `dx` is zero or negative (backward-pointing edges).
        const dx = toX - fromX;
        const controlOffsetPx = Math.max(
          MIN_CONTROL_OFFSET_PX,
          Math.abs(dx) * 0.5,
        );
        const path =
          `M ${fromX} ${fromY} ` +
          `C ${fromX + controlOffsetPx} ${fromY}, ` +
          `${toX - controlOffsetPx} ${toY}, ` +
          `${toX} ${toY}`;

        // Anchor the popover at the curve's geometric midpoint
        // ((fromX+toX)/2, (fromY+toY)/2 — exact midpoint of a symmetric
        // cubic Bézier) so the popover never overlaps either bar.
        const anchorXPx = (fromX + toX) / 2;
        const anchorYPx = (fromY + toY) / 2;

        const isHovered = hoveredId === dependency.id;
        const interactive = onDependencyClick !== undefined;

        return (
          <g key={dependency.id}>
            {/* Visible path — stays thin/dashed so the canvas doesn't
                feel cluttered. Pointer-events disabled here; the
                transparent hit-area sibling handles input. */}
            <path
              d={path}
              fill="none"
              stroke={isHovered ? hoverStroke : stroke}
              strokeDasharray="4 3"
              strokeWidth={isHovered ? 2.5 : 1.5}
              markerEnd={
                isHovered
                  ? 'url(#record-roadmap-dependency-arrow-hover)'
                  : 'url(#record-roadmap-dependency-arrow)'
              }
              style={{ pointerEvents: 'none' }}
            />
            {/* Invisible hit-area path: thicker stroke, transparent so it
                only catches events. Sits ON TOP so hover/click reliably
                land on it even when zoomed in or near the arrowhead. */}
            {interactive && (
              <path
                d={path}
                fill="none"
                stroke="transparent"
                strokeWidth={HIT_AREA_STROKE_WIDTH_PX}
                style={{
                  cursor: 'pointer',
                  pointerEvents: 'stroke',
                }}
                onPointerEnter={() => setHoveredId(dependency.id)}
                onPointerLeave={() =>
                  setHoveredId((prev) =>
                    prev === dependency.id ? null : prev,
                  )
                }
                onClick={(event) => {
                  event.stopPropagation();
                  onDependencyClick({
                    dependency,
                    anchorXPx,
                    anchorYPx,
                  });
                }}
              />
            )}
          </g>
        );
      })}
    </svg>
  );
};
