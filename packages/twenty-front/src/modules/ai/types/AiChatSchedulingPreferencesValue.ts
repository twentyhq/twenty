export type AiChatSchedulingPreferencesValue = {
  timeZone: string;
  workingDays: (1 | 2 | 3 | 4 | 5 | 6 | 7)[];
  workingHoursStart: string;
  workingHoursEnd: string;
  availabilityCalendarIds: string[];
  organizerCalendarId: string;
};
