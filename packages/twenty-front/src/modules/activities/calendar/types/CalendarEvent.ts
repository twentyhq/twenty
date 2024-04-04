// TODO: use backend CalendarEvent type when ready
export type CalendarEvent = {
  conferenceLink?: {
    label: string;
    url: string;
  };
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
  participants?: {
    displayName: string;
    workspaceMemberId?: string;
  }[];
};
