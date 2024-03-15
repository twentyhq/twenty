// TODO: use backend CalendarEvent type when ready
export type CalendarEvent = {
  conferenceUri?: string;
  description?: string;
  endsAt?: string;
  externalCreatedAt: string;
  id: string;
  isCanceled?: boolean;
  isFullDay: boolean;
  location?: string;
  startsAt: string;
  title?: string;
  visibility: 'METADATA' | 'SHARE_EVERYTHING';
  attendees?: {
    displayName: string;
    workspaceMemberId?: string;
  }[];
};
