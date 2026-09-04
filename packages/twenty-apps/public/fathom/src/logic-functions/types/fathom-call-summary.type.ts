export type FathomCallSummary = {
  recordingId: number;
  title: string;
  startedAt: string;
  durationMinutes: number;
  participants: string[];
  recordedBy: string;
  fathomUrl: string;
  meetingUrl?: string;
};
