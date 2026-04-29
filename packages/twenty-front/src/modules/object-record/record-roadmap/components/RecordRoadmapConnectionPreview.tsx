import { themeCssVariables } from 'twenty-ui/theme-constants';

type RecordRoadmapConnectionPreviewProps = {
  /** Origin port position in inner-canvas pixels. Null when no
      connection is in progress. */
  anchorXPx: number | null;
  anchorYPx: number | null;
  /** Live cursor position in inner-canvas pixels. Updated on each
      pointermove while a connection is pending. */
  cursorXPx: number | null;
  cursorYPx: number | null;
  canvasWidthPx: number;
  canvasHeightPx: number;
};

// SVG overlay that draws a single dashed line from the origin port to
// the user's cursor while a dependency is being authored. Renders nothing
// when no connection is in flight. Pointer events are disabled so the
// line never interferes with click-target detection on the dots.
export const RecordRoadmapConnectionPreview = ({
  anchorXPx,
  anchorYPx,
  cursorXPx,
  cursorYPx,
  canvasWidthPx,
  canvasHeightPx,
}: RecordRoadmapConnectionPreviewProps) => {
  if (
    anchorXPx === null ||
    anchorYPx === null ||
    cursorXPx === null ||
    cursorYPx === null
  ) {
    return null;
  }

  const stroke = themeCssVariables.accent.secondary;

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
        zIndex: 4,
      }}
    >
      <defs>
        <marker
          id="record-roadmap-connection-preview-arrow"
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
      <line
        x1={anchorXPx}
        y1={anchorYPx}
        x2={cursorXPx}
        y2={cursorYPx}
        stroke={stroke}
        strokeDasharray="4 3"
        strokeWidth={1.5}
        markerEnd="url(#record-roadmap-connection-preview-arrow)"
      />
    </svg>
  );
};
