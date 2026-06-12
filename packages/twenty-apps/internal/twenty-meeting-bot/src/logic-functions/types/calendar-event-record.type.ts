import { type MeetingBotPolicyCalendarEventInput } from 'src/logic-functions/types/meeting-bot-policy-calendar-event-input.type';

export type CalendarEventRecord = MeetingBotPolicyCalendarEventInput & {
  title: string | undefined;
};
