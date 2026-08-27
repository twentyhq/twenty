export type CalendarEventCandidate = {
  id: string;
  startsAt: string;
  conferenceLink: { primaryLinkUrl?: string | null } | string | null;
};
