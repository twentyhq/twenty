import { RECORD_CALENDAR_WEEK_DIMENSIONS } from '@/object-record/record-calendar/week/constants/RecordCalendarWeekDimensions';

type CalendarGridRect = {
  height: number;
  left: number;
  top: number;
  width: number;
};

type ResolveRecordCalendarWeekEventDropArgs = {
  dayCount: number;
  grabOffsetY: number;
  gridRect: CalendarGridRect;
  pointerX: number;
  pointerY: number;
};

export type RecordCalendarWeekEventDrop = {
  dayIndex: number;
  destinationMinutes: number;
};

export const resolveRecordCalendarWeekEventDrop = ({
  dayCount,
  grabOffsetY,
  gridRect,
  pointerX,
  pointerY,
}: ResolveRecordCalendarWeekEventDropArgs): RecordCalendarWeekEventDrop | null => {
  const daysLeft =
    gridRect.left + RECORD_CALENDAR_WEEK_DIMENSIONS.timeGutterWidth;
  const daysWidth =
    gridRect.width - RECORD_CALENDAR_WEEK_DIMENSIONS.timeGutterWidth;

  if (
    dayCount <= 0 ||
    pointerX < daysLeft ||
    pointerX >= daysLeft + daysWidth ||
    pointerY < gridRect.top ||
    pointerY >= gridRect.top + gridRect.height
  ) {
    return null;
  }

  const dayIndex = Math.floor((pointerX - daysLeft) / (daysWidth / dayCount));
  const eventTopInPixels =
    pointerY -
    gridRect.top -
    grabOffsetY -
    RECORD_CALENDAR_WEEK_DIMENSIONS.eventVerticalGap / 2;
  const unsnappedMinutes =
    (eventTopInPixels / RECORD_CALENDAR_WEEK_DIMENSIONS.hourHeight) * 60;
  const destinationMinutes = Math.min(
    24 * 60 - RECORD_CALENDAR_WEEK_DIMENSIONS.snapIntervalInMinutes,
    Math.max(
      0,
      Math.round(
        unsnappedMinutes /
          RECORD_CALENDAR_WEEK_DIMENSIONS.snapIntervalInMinutes,
      ) * RECORD_CALENDAR_WEEK_DIMENSIONS.snapIntervalInMinutes,
    ),
  );

  return { dayIndex, destinationMinutes };
};
