import { type CallRecorderPolicyCalendarEventInput } from 'src/logic-functions/types/call-recorder-policy-calendar-event-input.type';

export type CalendarEventRecord = CallRecorderPolicyCalendarEventInput & {
  title: string | undefined;
};
