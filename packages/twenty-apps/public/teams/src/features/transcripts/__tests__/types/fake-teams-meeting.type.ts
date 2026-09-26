export type FakeTeamsMeeting = {
  id: string;
  joinWebUrl: string;
  subject?: string;
  isExpired?: boolean;
  transcripts: { id: string; createdDateTime?: string }[];
};
