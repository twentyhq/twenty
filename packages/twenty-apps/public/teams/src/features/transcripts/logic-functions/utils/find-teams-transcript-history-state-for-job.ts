import { kv } from 'twenty-sdk/logic-function';

import { type TeamsTranscriptHistoryJobPayload } from 'src/features/transcripts/logic-functions/types/teams-transcript-history-job-payload.type';
import { type TeamsTranscriptHistoryState } from 'src/features/transcripts/logic-functions/types/teams-transcript-history-state.type';
import { buildTeamsTranscriptHistoryKvKey } from 'src/features/transcripts/logic-functions/utils/build-teams-transcript-history-kv-key';

export const findTeamsTranscriptHistoryStateForJob = async ({
  job,
}: {
  job: TeamsTranscriptHistoryJobPayload;
}): Promise<TeamsTranscriptHistoryState | undefined> => {
  const state = await kv.get<TeamsTranscriptHistoryState>(
    buildTeamsTranscriptHistoryKvKey(job.connectedAccountId),
  );

  return state?.runId === job.runId && state.phase === 'importing'
    ? state
    : undefined;
};
