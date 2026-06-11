import { type RecallRecordingBotPolicyCalendarEventInput } from 'src/logic-functions/types/recall-recording-bot-policy-calendar-event-input.type';

export type CalendarEventRecord = RecallRecordingBotPolicyCalendarEventInput & {
  title: string | undefined;
};
