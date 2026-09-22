export type TeamsCalendarEvent = {
  isOrganizer?: boolean;
  isCancelled?: boolean;
  onlineMeetingProvider?: string;
  onlineMeeting?: { joinUrl?: string | null } | null;
};
