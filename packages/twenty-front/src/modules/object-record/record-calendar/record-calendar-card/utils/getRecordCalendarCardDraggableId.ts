const RECORD_CALENDAR_CARD_DRAGGABLE_ID_PREFIX = 'calendar-card:';

export const getRecordCalendarCardDraggableId = ({
  calendarDay,
  recordId,
}: {
  calendarDay: string;
  recordId: string;
}) =>
  `${RECORD_CALENDAR_CARD_DRAGGABLE_ID_PREFIX}${encodeURIComponent(recordId)}:${calendarDay}`;
