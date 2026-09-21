import { gql } from '@apollo/client';

export const CALL_RECORDING_ID_FOR_CALENDAR_EVENT = gql`
  query CallRecordingIdForCalendarEvent($calendarEventId: UUID!) {
    callRecordingIdForCalendarEvent(calendarEventId: $calendarEventId)
  }
`;
