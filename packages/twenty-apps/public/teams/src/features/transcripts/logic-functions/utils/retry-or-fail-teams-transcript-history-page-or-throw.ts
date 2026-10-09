import { kv } from 'twenty-sdk/logic-function';
import { isDefined } from 'twenty-sdk/utils';

import { TEAMS_TRANSCRIPT_HISTORY_RETRY_DELAYS_MILLISECONDS } from 'src/features/transcripts/logic-functions/constants/teams-transcript-history-retry-delays-milliseconds';
import { type TeamsTranscriptHistoryJobPayload } from 'src/features/transcripts/logic-functions/types/teams-transcript-history-job-payload.type';
import { type TeamsTranscriptHistoryPageResult } from 'src/features/transcripts/logic-functions/types/teams-transcript-history-page-result.type';
import { type TeamsTranscriptHistoryRunningPhase } from 'src/features/transcripts/logic-functions/types/teams-transcript-history-running-phase.type';
import { type TeamsTranscriptHistoryState } from 'src/features/transcripts/logic-functions/types/teams-transcript-history-state.type';
import { buildTeamsTranscriptHistoryKvKey } from 'src/features/transcripts/logic-functions/utils/build-teams-transcript-history-kv-key';
import { enqueueTeamsTranscriptHistoryJobOrThrow } from 'src/features/transcripts/logic-functions/utils/enqueue-teams-transcript-history-job-or-throw';
import { findTeamsTranscriptHistoryStateForJob } from 'src/features/transcripts/logic-functions/utils/find-teams-transcript-history-state-for-job';
import { getTeamsTranscriptHistoryFatalErrorCode } from 'src/features/transcripts/logic-functions/utils/get-teams-transcript-history-fatal-error-code';

export const retryOrFailTeamsTranscriptHistoryPageOrThrow = async ({
  job,
  phase,
  error,
}: {
  job: TeamsTranscriptHistoryJobPayload;
  phase: TeamsTranscriptHistoryRunningPhase;
  error: unknown;
}): Promise<TeamsTranscriptHistoryPageResult> => {
  const state = await findTeamsTranscriptHistoryStateForJob({ job, phase });

  if (!isDefined(state)) {
    return {
      success: true,
      skipped: true,
      reason: 'Teams transcript history run was replaced or removed',
    };
  }

  const stateKvKey = buildTeamsTranscriptHistoryKvKey(job.connectedAccountId);
  const fatalErrorCode = getTeamsTranscriptHistoryFatalErrorCode(error);
  const retryDelayMilliseconds =
    TEAMS_TRANSCRIPT_HISTORY_RETRY_DELAYS_MILLISECONDS[job.attempt];

  if (isDefined(fatalErrorCode) || !isDefined(retryDelayMilliseconds)) {
    const errorCode = fatalErrorCode ?? 'unknown';

    await kv.set<TeamsTranscriptHistoryState>(stateKvKey, {
      ...state,
      phase: 'failed',
      errorCode,
      updatedAt: new Date().toISOString(),
    });

    return { success: false, errorCode };
  }

  await kv.set<TeamsTranscriptHistoryState>(stateKvKey, {
    ...state,
    updatedAt: new Date().toISOString(),
  });
  await enqueueTeamsTranscriptHistoryJobOrThrow({
    phase,
    job: { ...job, attempt: job.attempt + 1 },
    delayMilliseconds: retryDelayMilliseconds,
  });

  return { success: true, retryScheduled: true };
};
