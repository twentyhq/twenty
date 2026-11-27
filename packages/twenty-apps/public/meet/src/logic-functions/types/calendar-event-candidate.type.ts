export type CalendarEventCandidate = {
  id: string;
  title: string | null;
  startsAt: string;
  conferenceLink: { primaryLinkUrl?: string | null } | null;
};
