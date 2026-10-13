import { randomBytes } from 'node:crypto';
import { kv } from 'twenty-sdk/logic-function';
import { isDefined } from 'twenty-sdk/utils';

import { FEATURE_FLAGS } from 'src/constants/feature-flags';
import { TEAMS_TRANSCRIPT_HISTORY_INITIAL_IMPORT_DAYS } from 'src/features/transcripts/constants/teams-transcript-history-initial-import-days';
import { TRANSCRIPTS_ENABLED_APPLICATION_VARIABLE_KEY } from 'src/features/transcripts/constants/transcripts-enabled-application-variable-key';
import { MILLISECONDS_PER_DAY } from 'src/features/transcripts/logic-functions/constants/milliseconds-per-day';
import { type TeamsTranscriptHistoryState } from 'src/features/transcripts/logic-functions/types/teams-transcript-history-state.type';
import { buildTeamsTranscriptHistoryKvKey } from 'src/features/transcripts/logic-functions/utils/build-teams-transcript-history-kv-key';
import { deleteTeamsTranscriptHistoryKvKeys } from 'src/features/transcripts/logic-functions/utils/delete-teams-transcript-history-kv-keys';
import { enqueueTeamsTranscriptHistoryJobOrThrow } from 'src/features/transcripts/logic-functions/utils/enqueue-teams-transcript-history-job-or-throw';
import { isTeamsConnectionListed } from 'src/features/transcripts/logic-functions/utils/is-teams-connection-listed';
import { isTeamsTranscriptHistoryStalled } from 'src/features/transcripts/logic-functions/utils/is-teams-transcript-history-stalled';
import { isFeatureEnabled } from 'src/utils/is-feature-enabled';

export const startTeamsTranscriptHistoryInitialImportOrThrow = async ({
  connectedAccountId,
}: {
  connectedAccountId: string;
}): Promise<void> => {
  if (
    !isFeatureEnabled({
      isAvailable: FEATURE_FLAGS.IS_TRANSCRIPT_IMPORT_ENABLED,
      settingValue: process.env[TRANSCRIPTS_ENABLED_APPLICATION_VARIABLE_KEY],
    })
  ) {
    return;
  }

  const stateKvKey = buildTeamsTranscriptHistoryKvKey(connectedAccountId);
  const existingState = await kv.get<TeamsTranscriptHistoryState>(stateKvKey);
  const now = Date.now();

  if (
    isDefined(existingState) &&
    existingState.phase !== 'failed' &&
    !isTeamsTranscriptHistoryStalled({ state: existingState, now })
  ) {
    return;
  }

  const state: TeamsTranscriptHistoryState = {
    runId: randomBytes(8).toString('hex'),
    windowStart: new Date(
      now - TEAMS_TRANSCRIPT_HISTORY_INITIAL_IMPORT_DAYS * MILLISECONDS_PER_DAY,
    ).toISOString(),
    windowEnd: new Date(now).toISOString(),
    phase: 'importing',
    pageCount: 0,
    updatedAt: new Date(now).toISOString(),
  };

  await kv.set(stateKvKey, state);

  try {
    await enqueueTeamsTranscriptHistoryJobOrThrow({
      job: { connectedAccountId, runId: state.runId, pageIndex: 0, attempt: 0 },
      delayMilliseconds: 0,
    });
  } catch (error) {
    await kv.set<TeamsTranscriptHistoryState>(stateKvKey, {
      ...state,
      phase: 'failed',
    });

    throw error;
  }

  if (!(await isTeamsConnectionListed(connectedAccountId))) {
    await deleteTeamsTranscriptHistoryKvKeys({ connectedAccountId });
  }
};
