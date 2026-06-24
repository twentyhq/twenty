import { type CalendarEventRecord } from 'src/logic-functions/types/calendar-event-record.type';
import { type CallRecordingRecord } from 'src/logic-functions/types/call-recording-record.type';

export type MeetingRecording = {
  callRecording: CallRecordingRecord;
  calendarEvent: CalendarEventRecord;
};
