import { randomBytes } from 'node:crypto';
import { kv } from 'twenty-sdk/logic-function';

import { MILLISECONDS_PER_DAY } from 'src/features/transcripts/logic-functions/constants/milliseconds-per-day';
import { type TeamsTranscriptHistoryState } from 'src/features/transcripts/logic-functions/types/teams-transcript-history-state.type';
import { buildTeamsTranscriptHistoryKvKey } from 'src/features/transcripts/logic-functions/utils/build-teams-transcript-history-kv-key';
import { enqueueTeamsTranscriptHistoryJobOrThrow } from 'src/features/transcripts/logic-functions/utils/enqueue-teams-transcript-history-job-or-throw';

export const startTeamsTranscriptHistoryRunOrThrow = async ({
  connectedAccountId,
  days,
}: {
  connectedAccountId: string;
  days: number;
}): Promise<TeamsTranscriptHistoryState> => {
  const now = Date.now();
  const stateKvKey = buildTeamsTranscriptHistoryKvKey(connectedAccountId);
  const state: TeamsTranscriptHistoryState = {
    runId: randomBytes(8).toString('hex'),
    windowStart: new Date(now - days * MILLISECONDS_PER_DAY).toISOString(),
    windowEnd: new Date(now).toISOString(),
    phase: 'importing',
    pageCount: 0,
    importedCount: 0,
    skippedCount: 0,
    unavailableCount: 0,
    updatedAt: new Date(now).toISOString(),
  };

  await kv.set(stateKvKey, state);

  try {
    await enqueueTeamsTranscriptHistoryJobOrThrow({
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

  return state;
};
