import { isDefined } from 'twenty-sdk/utils';

import { TEAMS_TRANSCRIPT_HISTORY_COUNTING_POLL_MILLISECONDS } from 'src/features/transcripts/front-components/constants/teams-transcript-history-counting-poll-milliseconds';
import { TEAMS_TRANSCRIPT_HISTORY_IMPORTING_POLL_MILLISECONDS } from 'src/features/transcripts/front-components/constants/teams-transcript-history-importing-poll-milliseconds';
import { type TeamsTranscriptHistoryView } from 'src/features/transcripts/front-components/types/teams-transcript-history-view.type';

export const getTeamsTranscriptHistoryPollDelayMilliseconds = ({
  view,
  hasLoadError,
}: {
  view: TeamsTranscriptHistoryView | undefined;
  hasLoadError: boolean;
}): number | undefined => {
  if (!isDefined(view)) {
    return hasLoadError ? undefined : 0;
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
