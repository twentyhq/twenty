export type FakeTeamsMeeting = {
  id: string;
  joinWebUrl: string;
  subject?: string;
  transcripts: { id: string; createdDateTime?: string }[];
};
