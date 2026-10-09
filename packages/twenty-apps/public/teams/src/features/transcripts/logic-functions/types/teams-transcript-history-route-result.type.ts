import { type TeamsTranscriptHistoryRouteErrorCode } from 'src/features/transcripts/logic-functions/types/teams-transcript-history-route-error-code.type';
import { type TeamsTranscriptHistoryState } from 'src/features/transcripts/logic-functions/types/teams-transcript-history-state.type';

export type TeamsTranscriptHistoryRouteResult =
  | {
      success: true;
      state: TeamsTranscriptHistoryState | null;
      isStalled: boolean;
    }
  | { success: false; errorCode: TeamsTranscriptHistoryRouteErrorCode };
