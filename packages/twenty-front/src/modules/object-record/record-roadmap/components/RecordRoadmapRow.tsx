import { styled } from '@linaria/react';
import { type Temporal } from 'temporal-polyfill';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { RecordRoadmapBar } from '@/object-record/record-roadmap/components/RecordRoadmapBar';
import { ROADMAP_ROW_HEIGHT } from '@/object-record/record-roadmap/constants/RoadmapDimensions';

type RecordRoadmapRowProps = {
  recordId: string;
  label: string;
  startDate: Temporal.PlainDate;
  endDate: Temporal.PlainDate;
  plannedStartDate?: Temporal.PlainDate | null;
  plannedEndDate?: Temporal.PlainDate | null;
  status?: string | null;
  blockedBy?: string | null;
  viewportStart: Temporal.PlainDate;
  dayWidthPx: number;
  color: string | null;
  currentSwimlaneKey?: string | null;
  readOnly?: boolean;
  onCommit: (args: {
    recordId: string;
    startDate: Temporal.PlainDate;
    endDate: Temporal.PlainDate;
    targetSwimlaneKey?: string | null;
  }) => void;
  onOpenRecord?: (recordId: string) => void;
};

// Must match `StyledNameRow` in RecordRoadmapNameColumn pixel-for-pixel so
// the two panes' rows stay aligned through hundreds of rows of vertical
// scroll. `box-sizing: border-box` is the non-negotiable — without it the
// 1px border is added on top of height and each row drifts by one pixel.
//
// `data-roadmap-drop-target` is toggled by the bar drag hook on the row
// currently under the cursor. Inset shadows (not a top border) paint the
// indicator so the row height doesn't shift while the indicator is active.
const StyledRow = styled.div`
  border-bottom: 1px solid ${themeCssVariables.border.color.light};
  box-sizing: border-box;
  height: ${ROADMAP_ROW_HEIGHT}px;
  position: relative;

  &[data-roadmap-drop-target] {
    background-color: ${themeCssVariables.tag.background.sky};
    box-shadow:
      inset 0 2px 0 0 ${themeCssVariables.tag.text.blue},
      inset 0 -2px 0 0 ${themeCssVariables.tag.text.blue};
  }
`;

export const RecordRoadmapRow = ({
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
  readOnly,
  onCommit,
  onOpenRecord,
}: RecordRoadmapRowProps) => (
  // `data-roadmap-record-id` is read by the bar drag hook to resolve the
  // target row via elementFromPoint, enabling vertical reorder-by-position.
  <StyledRow data-roadmap-record-id={recordId}>
    <RecordRoadmapBar
      recordId={recordId}
      label={label}
      startDate={startDate}
      endDate={endDate}
      plannedStartDate={plannedStartDate}
      plannedEndDate={plannedEndDate}
      status={status}
      blockedBy={blockedBy}
      viewportStart={viewportStart}
      dayWidthPx={dayWidthPx}
      color={color}
      currentSwimlaneKey={currentSwimlaneKey}
      readOnly={readOnly}
      onCommit={onCommit}
      onClick={onOpenRecord}
    />
  </StyledRow>
);
