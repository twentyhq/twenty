import { TEAMS_TRANSCRIPT_HISTORY_STALL_THRESHOLD_MILLISECONDS } from 'src/features/transcripts/logic-functions/constants/teams-transcript-history-stall-threshold-milliseconds';
import { type TeamsTranscriptHistoryState } from 'src/features/transcripts/logic-functions/types/teams-transcript-history-state.type';

export const isTeamsTranscriptHistoryStalled = ({
  state,
  now,
}: {
  state: Pick<TeamsTranscriptHistoryState, 'phase' | 'updatedAt'>;
  now: number;
}): boolean =>
  (state.phase === 'counting' || state.phase === 'importing') &&
  now - Date.parse(state.updatedAt) >
    TEAMS_TRANSCRIPT_HISTORY_STALL_THRESHOLD_MILLISECONDS;
