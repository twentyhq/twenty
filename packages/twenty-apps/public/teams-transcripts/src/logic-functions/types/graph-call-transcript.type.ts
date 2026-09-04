export type GraphCallTranscript = {
  id: string;
  meetingId: string | null;
  callId?: string | null;
  createdDateTime: string | null;
  endDateTime?: string | null;
  transcriptContentUrl: string;
  meetingOrganizer?: {
    user?: { id?: string | null; displayName?: string | null } | null;
  } | null;
};
