import { type GraphDateTimeTimeZone } from 'src/features/transcripts/logic-functions/types/graph-date-time-time-zone.type';

export type TeamsCalendarEvent = {
  id?: string;
  iCalUId?: string | null;
  seriesMasterId?: string | null;
  isOrganizer?: boolean;
  isCancelled?: boolean;
  onlineMeetingProvider?: string;
  onlineMeeting?: { joinUrl?: string | null } | null;
  start?: GraphDateTimeTimeZone | null;
  end?: GraphDateTimeTimeZone | null;
};
