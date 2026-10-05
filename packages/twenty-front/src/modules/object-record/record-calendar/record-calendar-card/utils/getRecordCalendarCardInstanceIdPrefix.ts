import { RECORD_CALENDAR_CARD_INPUT_ID_PREFIX } from '@/object-record/record-calendar/record-calendar-card/constants/RecordCalendarCardInputIdPrefix';

export const getRecordCalendarCardInstanceIdPrefix = (calendarDay: string) =>
  `${RECORD_CALENDAR_CARD_INPUT_ID_PREFIX}-${calendarDay}`;
