import { type TeamsTranscriptHistoryState } from 'src/features/transcripts/logic-functions/types/teams-transcript-history-state.type';

export type TeamsTranscriptHistoryPageCounts = Pick<
  TeamsTranscriptHistoryState,
  'importedCount' | 'skippedCount' | 'unavailableCount'
>;
