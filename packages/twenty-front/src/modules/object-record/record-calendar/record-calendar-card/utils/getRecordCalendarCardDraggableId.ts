const RECORD_CALENDAR_CARD_DRAGGABLE_ID_PREFIX = 'calendar-card:';

export const getRecordCalendarCardDraggableId = ({
  calendarDay,
  recordId,
}: {
  calendarDay: string;
  recordId: string;
}) =>
  `${RECORD_CALENDAR_CARD_DRAGGABLE_ID_PREFIX}${encodeURIComponent(recordId)}:${calendarDay}`;

export const getRecordIdFromRecordCalendarCardDraggableId = (
  draggableId: string,
) => {
  if (!draggableId.startsWith(RECORD_CALENDAR_CARD_DRAGGABLE_ID_PREFIX)) {
    return draggableId;
  }

  const encodedRecordIdAndCalendarDay = draggableId.slice(
    RECORD_CALENDAR_CARD_DRAGGABLE_ID_PREFIX.length,
  );
  const calendarDaySeparatorIndex =
    encodedRecordIdAndCalendarDay.lastIndexOf(':');

  if (calendarDaySeparatorIndex <= 0) {
    return draggableId;
  }

  try {
    return decodeURIComponent(
      encodedRecordIdAndCalendarDay.slice(0, calendarDaySeparatorIndex),
    );
  } catch {
    return draggableId;
  }
};
