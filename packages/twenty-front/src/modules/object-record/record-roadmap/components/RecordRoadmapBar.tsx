import { styled } from '@linaria/react';
import { Temporal } from 'temporal-polyfill';
import { type ThemeColor } from 'twenty-ui/theme';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import { IconLock } from 'twenty-ui/display';

import {
  ROADMAP_BAR_HEIGHT,
  ROADMAP_BAR_VERTICAL_PADDING,
  ROADMAP_ROW_HEIGHT,
} from '@/object-record/record-roadmap/constants/RoadmapDimensions';
import { getRoadmapBlockedByColor } from '@/object-record/record-roadmap/constants/roadmapBlockedByColorMap';
import { useRecordRoadmapBarInteraction } from '@/object-record/record-roadmap/hooks/useRecordRoadmapBarInteraction';
import { computeRoadmapDeviation } from '@/object-record/record-roadmap/hooks/useRecordRoadmapDeviation';
import { computeRoadmapBarPosition } from '@/object-record/record-roadmap/utils/computeRoadmapBarPosition';

const RESIZE_HANDLE_WIDTH = 6;

// Default fill/border use the tag `blue` tokens so unclassified bars still
// read as interactive controls (the previous `background.secondary` gray
// was low-contrast against the canvas background, especially in dark mode).
// When a `color` prop resolves to a specific SELECT option, inline styles
// override these values with that option's theme color.
const StyledBar = styled.div<{ hasError: boolean; isDragging: boolean }>`
  align-items: center;
  background-color: ${(props) =>
    props.isDragging
      ? themeCssVariables.tag.background.sky
      : themeCssVariables.tag.background.blue};
  border: 1px solid
    ${(props) =>
      props.hasError
        ? themeCssVariables.border.color.danger
        : themeCssVariables.tag.text.blue};
  border-radius: 4px;
  color: ${themeCssVariables.tag.text.blue};
  cursor: grab;
  display: flex;
  font-size: ${themeCssVariables.font.size.sm};
  height: ${ROADMAP_BAR_HEIGHT}px;
  opacity: ${(props) => (props.isDragging ? 0.85 : 1)};
  overflow: hidden;
  padding: 0 ${themeCssVariables.spacing[2]};
  position: absolute;
  text-overflow: ellipsis;
  top: ${ROADMAP_BAR_VERTICAL_PADDING}px;
  touch-action: none;
  user-select: none;
  white-space: nowrap;

  &:hover {
    background-color: ${themeCssVariables.tag.background.sky};
  }

  &:active {
    cursor: grabbing;
  }
`;

// Linaria compiles CSS statically so we can't interpolate a whole
// `left: 0;` vs `right: 0;` declaration from a prop. Two siblings — shared
// styling, different edge — keep each handle anchored reliably.
const StyledResizeHandleBase = styled.div`
  cursor: ew-resize;
  height: 100%;
  position: absolute;
  top: 0;
  touch-action: none;
  width: ${RESIZE_HANDLE_WIDTH}px;
  /* Sits above the draggable body so pointer-down reaches the handle first. */
  z-index: 1;
`;

const StyledResizeHandleLeft = styled(StyledResizeHandleBase)`
  left: 0;
`;

const StyledResizeHandleRight = styled(StyledResizeHandleBase)`
  right: 0;
`;

// Flex:1 so it fills the bar between the two resize handles and truncates
// with ellipsis when the bar is narrower than the label. `pointer-events:
// none` lets the parent bar's pointer handlers (drag / click-to-open) keep
// receiving events instead of the label swallowing them.
const StyledLabel = styled.span`
  flex: 1;
  overflow: hidden;
  pointer-events: none;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

// Ghost bar shows the originally planned range. It's taller than the
// live bar so its top + bottom slivers stay visible even when the actual
// range overlaps it, and it's drawn on a higher z-index than the row
// background so it doesn't get washed out by the canvas grid. The dashed
// border + diagonal hash is the canonical Gantt "planned" convention.
const StyledGhostBar = styled.div`
  background: repeating-linear-gradient(
    -45deg,
    ${themeCssVariables.background.transparent.strong} 0px,
    ${themeCssVariables.background.transparent.strong} 4px,
    transparent 4px,
    transparent 8px
  );
  border: 1.5px dashed ${themeCssVariables.font.color.tertiary};
  border-radius: 4px;
  box-sizing: border-box;
  height: ${ROADMAP_ROW_HEIGHT - 4}px;
  pointer-events: none;
  position: absolute;
  top: 2px;
  z-index: 0;
`;

// Vertical caps anchored at planned start / planned end. They span the
// whole row and sit on a z-index above the live bar, so the planned
// boundaries stay readable even when the actual range fully covers the
// ghost rectangle. The triangle "flag" on top makes the date easy to
// spot without a tooltip.
const StyledGhostMarker = styled.div`
  border-left: 2px dashed ${themeCssVariables.font.color.tertiary};
  height: ${ROADMAP_ROW_HEIGHT}px;
  pointer-events: none;
  position: absolute;
  top: 0;
  width: 0;
  z-index: 2;

  &::before {
    background-color: ${themeCssVariables.font.color.tertiary};
    border-radius: 50%;
    content: '';
    height: 6px;
    left: -4px;
    position: absolute;
    top: 0;
    width: 6px;
  }
`;

const StyledLockIcon = styled.span`
  align-items: center;
  display: inline-flex;
  flex-shrink: 0;
  margin-right: ${themeCssVariables.spacing[1]};
  pointer-events: none;
`;

type RecordRoadmapBarProps = {
  recordId: string;
  label: string;
  startDate: Temporal.PlainDate;
  endDate: Temporal.PlainDate;
  /** Planned start date — paired with `plannedEndDate`, draws the
      dashed ghost bar over the original plan range. Falls back to
      `startDate` when null so a ghost bar still appears when only
      `plannedEndDate` is configured. */
  plannedStartDate?: Temporal.PlainDate | null;
  /** Planned end date — when set and ≠ endDate, draws a dashed ghost
      bar showing the original plan. */
  plannedEndDate?: Temporal.PlainDate | null;
  /** SELECT value of status. DONE/CANCELLED suppress the overdue glow
      even if today > end. */
  status?: string | null;
  /** SELECT value of blockedBy (NONE/CLIENT/INTERNAL/EXTERNAL_VENDOR or
      a custom value). Drives the lock badge + tinted bar color. */
  blockedBy?: string | null;
  viewportStart: Temporal.PlainDate;
  dayWidthPx: number;
  /** SELECT-option color name (e.g. 'blue'). Null when the view has no
      color field or the record's value doesn't match an option. */
  color: string | null;
  currentSwimlaneKey?: string | null;
  readOnly?: boolean;
  onCommit: (args: {
    recordId: string;
    startDate: Temporal.PlainDate;
    endDate: Temporal.PlainDate;
    targetSwimlaneKey?: string | null;
  }) => void;
  onClick?: (recordId: string) => void;
};

// Pull both the fill and the stronger accent straight from the existing Tag
// color tokens. This keeps the palette in lock-step with Chips/Tags elsewhere
// in the product — no new palette to maintain, dark-mode handled by the
// CSS variables themselves. The map is intentionally loose (Record with
// ThemeColor keys) so non-matching values fall back to the neutral bar.
const getColorTokensFor = (
  color: string | null,
): { background: string; accent: string } | null => {
  if (color === null) return null;
  const backgrounds = themeCssVariables.tag.background as Record<
    ThemeColor,
    string
  >;
  const texts = themeCssVariables.tag.text as Record<ThemeColor, string>;
  const typedColor = color as ThemeColor;
  if (!(typedColor in backgrounds)) return null;
  return { background: backgrounds[typedColor], accent: texts[typedColor] };
};

export const RecordRoadmapBar = ({
  recordId,
  label,
  startDate,
  endDate,
  plannedStartDate,
  plannedEndDate,
  status,
  blockedBy,
  viewportStart,
  dayWidthPx,
  color,
  currentSwimlaneKey,
  readOnly = false,
  onCommit,
  onClick,
}: RecordRoadmapBarProps) => {
  const {
    deltaDays,
    deltaYPx,
    mode,
    onPointerDownMove,
    onPointerDownResizeStart,
    onPointerDownResizeEnd,
  } = useRecordRoadmapBarInteraction({
    recordId,
    startDate,
    endDate,
    dayWidthPx,
    currentSwimlaneKey,
    onCommit,
    onClick,
  });

  // Apply the transient drag delta to the rendered position so the bar
  // follows the cursor in real time. The commit fires on pointerup; until
  // then the Apollo cache still holds the original dates.
  const previewStart =
    mode === 'move' || mode === 'resize-start'
      ? startDate.add({ days: deltaDays })
      : startDate;
  const previewEnd =
    mode === 'move' || mode === 'resize-end'
      ? endDate.add({ days: deltaDays })
      : endDate;

  const { leftPx, widthPx, durationDays } = computeRoadmapBarPosition({
    startDate: previewStart,
    endDate: previewEnd,
    viewportStart,
    dayWidthPx,
  });

  const hasError = durationDays < 0;

  // Overdue / deviation are computed from the *planned* dates, never the
  // drag preview, so dragging an in-progress bar doesn't flicker the red
  // border. `today` is the wall-clock day at first paint — fine here
  // because the bar is shallow and re-mounts cheaply.
  const today = Temporal.Now.plainDateISO();
  const { isOverdue, deviationDays } = computeRoadmapDeviation({
    plannedEndDate: plannedEndDate ?? null,
    actualEndDate: endDate,
    status: status ?? null,
    today,
  });

  // Ghost bar shows the originally planned range. We render it whenever
  // the plan diverges from the live bar in any direction — either start
  // or end. plannedStart falls back to the live start so views that only
  // configure `plannedEnd` still get a meaningful ghost.
  const ghostStart =
    plannedStartDate !== null && plannedStartDate !== undefined
      ? plannedStartDate
      : startDate;
  const ghostEnd =
    plannedEndDate !== null && plannedEndDate !== undefined
      ? plannedEndDate
      : null;
  const hasGhostBar =
    ghostEnd !== null &&
    (Temporal.PlainDate.compare(ghostStart, startDate) !== 0 ||
      Temporal.PlainDate.compare(ghostEnd, endDate) !== 0);

  const ghostBarLayout = hasGhostBar
    ? computeRoadmapBarPosition({
        startDate: ghostStart,
        endDate: ghostEnd as Temporal.PlainDate,
        viewportStart,
        dayWidthPx,
      })
    : null;

  const blockedByColorToken = getRoadmapBlockedByColor(blockedBy);
  const blockedByBackground =
    blockedByColorToken !== null
      ? (themeCssVariables.tag.background as Record<ThemeColor, string>)[
          blockedByColorToken
        ]
      : null;
  const blockedByAccent =
    blockedByColorToken !== null
      ? (themeCssVariables.tag.text as Record<ThemeColor, string>)[
          blockedByColorToken
        ]
      : null;

  // Color wins over the default bar tokens unless the bar is in an error
  // state — red border should stay dominant. Dragging slightly bumps
  // opacity; the inline override here leaves base CSS untouched for other
  // states (hover, non-colored bars). `blockedBy` overrides `color` so the
  // responsibility tint is always visible (an OPEN milestone blocked by
  // the client should look orange, not stage-color).
  const colorTokens = getColorTokensFor(color);
  const colorStyle =
    blockedByBackground !== null && blockedByAccent !== null && !hasError
      ? {
          backgroundColor: blockedByBackground,
          borderColor: blockedByAccent,
          color: blockedByAccent,
        }
      : colorTokens !== null && !hasError
        ? {
            backgroundColor: colorTokens.background,
            borderColor: colorTokens.accent,
            color: colorTokens.accent,
          }
        : {};

  // Overdue takes priority for the border once we're past the error /
  // blocked tints — a 2px solid danger stripe so the user can spot
  // late-running bars at a glance even when scrolled out.
  const overdueBorderStyle =
    isOverdue && !hasError
      ? {
          border: `2px solid ${themeCssVariables.border.color.danger}`,
        }
      : {};

  const isMoveDrag = mode === 'move';
  // While moving, lift the bar above the rows so `elementFromPoint` sees the
  // row underneath (and so the drop-target highlight reads correctly). The
  // transform lets the bar follow the cursor vertically, making the drag feel
  // physical. z-index + box-shadow give it a "lifted" look over neighbors.
  const dragStyle = isMoveDrag
    ? {
        transform: `translateY(${deltaYPx}px)`,
        pointerEvents: 'none' as const,
        zIndex: 3,
        boxShadow: themeCssVariables.boxShadow.strong,
      }
    : {};

  const tooltipParts = [`${label} (${previewStart.toString()} → ${previewEnd.toString()})`];
  if (isOverdue) {
    tooltipParts.push(`${deviationDays} day${deviationDays === 1 ? '' : 's'} overdue`);
  }
  if (blockedBy && blockedBy !== 'NONE') {
    tooltipParts.push(`Blocked by: ${blockedBy}`);
  }
  const tooltipText = hasError
    ? `End date is before start date (${previewStart.toString()} → ${previewEnd.toString()})`
    : tooltipParts.join(' — ');

  return (
    <>
      {ghostBarLayout !== null && (
        <>
          <StyledGhostBar
            aria-hidden
            style={{
              left: ghostBarLayout.leftPx,
              width: ghostBarLayout.widthPx,
            }}
            title={`Planned: ${ghostStart.toString()} → ${plannedEndDate?.toString() ?? ''}`}
          />
          <StyledGhostMarker
            aria-hidden
            style={{ left: ghostBarLayout.leftPx }}
            title={`Planned start: ${ghostStart.toString()}`}
          />
          <StyledGhostMarker
            aria-hidden
            style={{
              left: ghostBarLayout.leftPx + ghostBarLayout.widthPx,
            }}
            title={`Planned end: ${plannedEndDate?.toString() ?? ''}`}
          />
        </>
      )}
      <StyledBar
        hasError={hasError}
        isDragging={mode !== null}
        data-roadmap-bar
        style={{
          left: leftPx,
          width: widthPx,
          ...colorStyle,
          ...overdueBorderStyle,
          ...dragStyle,
          // Read-only mode: behave like a link (pointer cursor, no grabbing)
          // since drag/resize are disabled.
          ...(readOnly ? { cursor: 'pointer' } : {}),
        }}
        onPointerDown={readOnly ? undefined : onPointerDownMove}
        onClick={readOnly ? () => onClick?.(recordId) : undefined}
        title={tooltipText}
      >
        {!readOnly && (
          <StyledResizeHandleLeft onPointerDown={onPointerDownResizeStart} />
        )}
        {blockedBy && blockedBy !== 'NONE' && (
          <StyledLockIcon>
            <IconLock size={12} />
          </StyledLockIcon>
        )}
        <StyledLabel>{label}</StyledLabel>
        {!readOnly && (
          <StyledResizeHandleRight onPointerDown={onPointerDownResizeEnd} />
        )}
      </StyledBar>
    </>
  );
};
