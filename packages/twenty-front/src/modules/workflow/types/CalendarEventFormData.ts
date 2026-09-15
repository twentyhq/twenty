export type CalendarEventFormData = {
  connectedAccountId: string;
  title: string;
  description: string;
  location: string;
  startsAt: string;
  endsAt: string;
  isFullDay: boolean;
  timeZone: string;
  attendees: string;
  sendInvitations: boolean;
  addConferencing: boolean;
};
