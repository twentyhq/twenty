import { isDefined } from 'twenty-sdk/utils';

import { type TeamsTranscriptHistoryState } from 'src/features/transcripts/logic-functions/types/teams-transcript-history-state.type';
import { isTeamsTranscriptHistoryStalled } from 'src/features/transcripts/logic-functions/utils/is-teams-transcript-history-stalled';

export const shouldStartTeamsTranscriptHistoryInitialImport = ({
  hasStartedInitialImport,
  state,
  now,
}: {
  hasStartedInitialImport: boolean;
  state: TeamsTranscriptHistoryState | null;
  now: number;
}): boolean =>
  !hasStartedInitialImport ||
  !isDefined(state) ||
  (state.phase === 'failed' && state.errorCode !== 'page-limit-reached') ||
  isTeamsTranscriptHistoryStalled({ state, now });
