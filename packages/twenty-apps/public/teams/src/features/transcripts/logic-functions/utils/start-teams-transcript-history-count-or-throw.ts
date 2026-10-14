import { kv } from 'twenty-sdk/logic-function';
import { isDefined } from 'twenty-sdk/utils';

import { type TeamsTranscriptHistoryRouteResult } from 'src/features/transcripts/logic-functions/types/teams-transcript-history-route-result.type';
import { type TeamsTranscriptHistoryState } from 'src/features/transcripts/logic-functions/types/teams-transcript-history-state.type';
import { buildTeamsTranscriptHistoryKvKey } from 'src/features/transcripts/logic-functions/utils/build-teams-transcript-history-kv-key';
import { isTeamsTranscriptHistoryStalled } from 'src/features/transcripts/logic-functions/utils/is-teams-transcript-history-stalled';
import { startTeamsTranscriptHistoryRunOrThrow } from 'src/features/transcripts/logic-functions/utils/start-teams-transcript-history-run-or-throw';

export const startTeamsTranscriptHistoryCountOrThrow = async ({
  connectedAccountId,
  days,
}: {
  connectedAccountId: string;
  days: number;
}): Promise<TeamsTranscriptHistoryRouteResult> => {
  const currentState = await kv.get<TeamsTranscriptHistoryState>(
    buildTeamsTranscriptHistoryKvKey(connectedAccountId),
  );

  if (
    isDefined(currentState) &&
    (currentState.phase === 'counting' || currentState.phase === 'importing') &&
    !isTeamsTranscriptHistoryStalled({ state: currentState, now: Date.now() })
  ) {
    return { success: false, errorCode: 'run-already-active' };
  }

  const state = await startTeamsTranscriptHistoryRunOrThrow({
    connectedAccountId,
    days,
    phase: 'counting',
  });

  return { success: true, state, isStalled: false };
};
