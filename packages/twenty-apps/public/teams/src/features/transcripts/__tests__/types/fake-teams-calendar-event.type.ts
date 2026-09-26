export type FakeTeamsCalendarEvent = {
  joinUrl: string;
  startDateTime: string;
  endDateTime: string;
  isOrganizer?: boolean;
  isCancelled?: boolean;
  onlineMeetingProvider?: string;
};
