import { type CompanionPolicyCalendarEventInput } from 'src/logic-functions/types/companion-policy-calendar-event-input.type';

export type CalendarEventRecord = CompanionPolicyCalendarEventInput & {
  title: string | undefined;
};
