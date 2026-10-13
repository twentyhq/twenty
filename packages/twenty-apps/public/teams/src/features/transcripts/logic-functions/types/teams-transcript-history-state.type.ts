import { type TeamsTranscriptHistoryJobPayload } from 'src/features/transcripts/logic-functions/types/teams-transcript-history-job-payload.type';

export type TeamsTranscriptHistoryState = {
  runId: string;
  windowStart: string;
  windowEnd: string;
  phase: 'importing' | 'imported' | 'failed';
  pageCount: number;
  updatedAt: string;
  nextJob?: TeamsTranscriptHistoryJobPayload;
};
