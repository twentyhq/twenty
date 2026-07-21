import { RECORD_CALENDAR_WEEK_DIMENSIONS } from '@/object-record/record-calendar/week/constants/RecordCalendarWeekDimensions';

type GetRecordCalendarWeekSlotIndexArgs = {
  columnHeight: number;
  columnTop: number;
  pointerY: number;
};

export const getRecordCalendarWeekSlotIndex = ({
  columnHeight,
  columnTop,
  pointerY,
}: GetRecordCalendarWeekSlotIndexArgs): number | null => {
  if (pointerY < columnTop || pointerY >= columnTop + columnHeight) {
    return null;
  }

  const slotCount =
    (RECORD_CALENDAR_WEEK_DIMENSIONS.hoursInDay * 60) /
    RECORD_CALENDAR_WEEK_DIMENSIONS.snapIntervalInMinutes;

  return Math.min(
    slotCount - 1,
    Math.floor(
      (pointerY - columnTop) / RECORD_CALENDAR_WEEK_DIMENSIONS.slotHeight,
    ),
  );
};
