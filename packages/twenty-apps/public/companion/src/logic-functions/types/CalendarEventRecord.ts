import { type CompanionPolicyCalendarEventInput } from 'src/logic-functions/types/CompanionPolicyCalendarEventInput';

export type CalendarEventRecord = CompanionPolicyCalendarEventInput & {
  title: string | undefined;
};
