function createRecordCalendarWeekDimensions({
  hourHeight,
  hoursInDay,
  snapIntervalInMinutes,
}: {
  hourHeight: number;
  hoursInDay: number;
  snapIntervalInMinutes: number;
}) {
  return {
    eventVerticalGap: 8,
    gridHeight: hoursInDay * hourHeight,
    hourHeight,
    hoursInDay,
    minimumEventSlotHeight: 24,
    slotHeight: (hourHeight * snapIntervalInMinutes) / 60,
    snapIntervalInMinutes,
    timeGutterWidth: 56,
  } as const;
}

export const RECORD_CALENDAR_WEEK_DIMENSIONS =
  createRecordCalendarWeekDimensions({
    hourHeight: 48,
    hoursInDay: 24,
    snapIntervalInMinutes: 30,
  });
