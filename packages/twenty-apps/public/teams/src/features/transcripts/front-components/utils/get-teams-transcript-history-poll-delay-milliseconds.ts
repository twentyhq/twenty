import { isDefined } from 'twenty-sdk/utils';

import { TEAMS_TRANSCRIPT_HISTORY_COUNTING_POLL_MILLISECONDS } from 'src/features/transcripts/front-components/constants/teams-transcript-history-counting-poll-milliseconds';
import { TEAMS_TRANSCRIPT_HISTORY_IMPORTING_POLL_MILLISECONDS } from 'src/features/transcripts/front-components/constants/teams-transcript-history-importing-poll-milliseconds';
import { type TeamsTranscriptHistoryView } from 'src/features/transcripts/front-components/types/teams-transcript-history-view.type';
import { type TeamsTranscriptHistoryRouteErrorCode } from 'src/features/transcripts/logic-functions/types/teams-transcript-history-route-error-code.type';

export const getTeamsTranscriptHistoryPollDelayMilliseconds = ({
  view,
  loadErrorCode,
}: {
  view: TeamsTranscriptHistoryView | undefined;
  loadErrorCode: TeamsTranscriptHistoryRouteErrorCode | undefined;
}): number | undefined => {
  if (!isDefined(view)) {
    return isDefined(loadErrorCode) ? undefined : 0;
  }

  // Only an unexpected failure may clear up on its own; the other codes need the member to act first.
  if (isDefined(loadErrorCode) && loadErrorCode !== 'unknown') {
    return undefined;
  }

  switch (view.kind) {
    case 'counting':
      return TEAMS_TRANSCRIPT_HISTORY_COUNTING_POLL_MILLISECONDS;
    case 'importing':
      return TEAMS_TRANSCRIPT_HISTORY_IMPORTING_POLL_MILLISECONDS;
    default:
      return undefined;
  }
};
