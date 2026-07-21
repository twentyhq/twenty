const RECORD_CALENDAR_WEEK_EVENT_HORIZONTAL_INSET = 4;
const RECORD_CALENDAR_WEEK_EVENT_COLUMN_GAP = 2;
const RECORD_CALENDAR_WEEK_EVENT_POSITION_ROUNDING_FACTOR = 10_000;

type GetRecordCalendarWeekEventHorizontalPositionArgs = {
  columnCount: number;
  columnIndex: number;
};

export type RecordCalendarWeekEventHorizontalPosition = {
  hoverStackingOrder: number;
  left: string;
  stackingOrder: number;
  width: string;
};

const roundPositionValue = (value: number) =>
  Math.round(value * RECORD_CALENDAR_WEEK_EVENT_POSITION_ROUNDING_FACTOR) /
  RECORD_CALENDAR_WEEK_EVENT_POSITION_ROUNDING_FACTOR;

const formatPercentageWithPixelOffset = (
  percentage: number,
  pixelOffset: number,
) =>
  pixelOffset < 0
    ? `calc(${percentage}% - ${Math.abs(pixelOffset)}px)`
    : `calc(${percentage}% + ${pixelOffset}px)`;

export const getRecordCalendarWeekEventHorizontalPosition = ({
  columnCount,
  columnIndex,
}: GetRecordCalendarWeekEventHorizontalPositionArgs): RecordCalendarWeekEventHorizontalPosition => {
  const columnSpan = columnCount - columnIndex;
  const leftPercentage = roundPositionValue((columnIndex * 100) / columnCount);
  const leftPixelOffset = roundPositionValue(
    RECORD_CALENDAR_WEEK_EVENT_HORIZONTAL_INSET -
      ((RECORD_CALENDAR_WEEK_EVENT_HORIZONTAL_INSET * 2 -
        RECORD_CALENDAR_WEEK_EVENT_COLUMN_GAP) *
        columnIndex) /
        columnCount,
  );
  const widthPercentage = roundPositionValue((columnSpan * 100) / columnCount);
  const widthPixelReduction = roundPositionValue(
    RECORD_CALENDAR_WEEK_EVENT_COLUMN_GAP +
      ((RECORD_CALENDAR_WEEK_EVENT_HORIZONTAL_INSET * 2 -
        RECORD_CALENDAR_WEEK_EVENT_COLUMN_GAP) *
        columnSpan) /
        columnCount,
  );

  return {
    hoverStackingOrder: columnCount + 1,
    left: formatPercentageWithPixelOffset(leftPercentage, leftPixelOffset),
    stackingOrder: columnIndex + 1,
    width: `calc(${widthPercentage}% - ${widthPixelReduction}px)`,
  };
};
