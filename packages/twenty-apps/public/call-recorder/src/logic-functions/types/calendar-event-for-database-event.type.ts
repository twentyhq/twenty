export type CalendarEventForDatabaseEvent = {
  id: string;
  callRecorderPreference?: string | null;
  conferenceLink?: { primaryLinkUrl?: string | null } | null;
  location?: string | null;
  description?: string | null;
  iCalUid?: string | null;
  startsAt?: string | null;
};
