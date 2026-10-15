import { type TeamsTranscriptHistoryState } from 'src/features/transcripts/logic-functions/types/teams-transcript-history-state.type';

export const getTeamsTranscriptHistoryToImportCount = ({
  transcriptCount,
  alreadyImportedCount,
  deletedCount,
}: Pick<
  TeamsTranscriptHistoryState,
  'transcriptCount' | 'alreadyImportedCount' | 'deletedCount'
>): number => transcriptCount - alreadyImportedCount - deletedCount;
