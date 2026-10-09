import { kv } from 'twenty-sdk/logic-function';

import { type TeamsTranscriptHistoryRunningPhase } from 'src/features/transcripts/logic-functions/types/teams-transcript-history-running-phase.type';
import { type TeamsTranscriptHistoryState } from 'src/features/transcripts/logic-functions/types/teams-transcript-history-state.type';
import { buildTeamsTranscriptHistoryKvKey } from 'src/features/transcripts/logic-functions/utils/build-teams-transcript-history-kv-key';
import { enqueueTeamsTranscriptHistoryJobOrThrow } from 'src/features/transcripts/logic-functions/utils/enqueue-teams-transcript-history-job-or-throw';

export const scheduleTeamsTranscriptHistoryRunOrThrow = async ({
  connectedAccountId,
  state,
}: {
  connectedAccountId: string;
  state: TeamsTranscriptHistoryState & {
    phase: TeamsTranscriptHistoryRunningPhase;
  };
}): Promise<void> => {
  const stateKvKey = buildTeamsTranscriptHistoryKvKey(connectedAccountId);

  await kv.set(stateKvKey, state);

  try {
    await enqueueTeamsTranscriptHistoryJobOrThrow({
      phase: state.phase,
      job: {
        connectedAccountId,
        runId: state.runId,
        chunkIndex: 0,
        pageIndex: 0,
        attempt: 0,
      },
      delayMilliseconds: 0,
    });
  } catch (error) {
    await kv.set<TeamsTranscriptHistoryState>(stateKvKey, {
      ...state,
      phase: 'failed',
      errorCode: 'unknown',
    });

    throw error;
  }
};
