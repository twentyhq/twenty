import { type EmailComposerContextRecord } from '@/activities/emails/recipients/types/EmailComposerContextRecord';

export type CalendarEventComposerInitialValues = {
  connectedAccountId: string;
  contextRecord: EmailComposerContextRecord;
  defaultAttendees: string;
  defaultAttendeePersonId?: string;
  timeZone: string;
};
