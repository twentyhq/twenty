// TODO: use backend CalendarEvent type when ready
export type CalendarEvent = {
  endsAt?: Date;
  id: string;
  isFullDay: boolean;
  startsAt: Date;
  isCanceled?: boolean;
  title?: string;
  visibility: 'METADATA' | 'SHARE_EVERYTHING';
  attendees?: {
    displayName: string;
    workspaceMemberId?: string;
  }[];
};
