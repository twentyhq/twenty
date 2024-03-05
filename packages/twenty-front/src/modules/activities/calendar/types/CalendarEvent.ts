// TODO: use backend CalendarEvent type when ready
export type CalendarEvent = {
  endDate?: Date;
  id: string;
  isFullDay: boolean;
  startDate: Date;
  status: 'confirmed' | 'tentative' | 'cancelled';
  title?: string;
  visibility: 'metadata' | 'share_everything';
};
