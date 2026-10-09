import { kv } from 'twenty-sdk/logic-function';
import { isDefined } from 'twenty-sdk/utils';

import { FEATURE_FLAGS } from 'src/constants/feature-flags';
import { TEAMS_TRANSCRIPT_HISTORY_INITIAL_IMPORT_DAYS } from 'src/features/transcripts/constants/teams-transcript-history-initial-import-days';
import { TRANSCRIPTS_ENABLED_APPLICATION_VARIABLE_KEY } from 'src/features/transcripts/constants/transcripts-enabled-application-variable-key';
import { buildTeamsTranscriptHistoryInitialImportKvKey } from 'src/features/transcripts/logic-functions/utils/build-teams-transcript-history-initial-import-kv-key';
import { deleteTeamsTranscriptHistoryKvKeys } from 'src/features/transcripts/logic-functions/utils/delete-teams-transcript-history-kv-keys';
import { isTeamsConnectionListed } from 'src/features/transcripts/logic-functions/utils/is-teams-connection-listed';
import { startTeamsTranscriptHistoryRunOrThrow } from 'src/features/transcripts/logic-functions/utils/start-teams-transcript-history-run-or-throw';
import { isFeatureEnabled } from 'src/utils/is-feature-enabled';

export const startTeamsTranscriptHistoryInitialImportOrThrow = async ({
  connectedAccountId,
}: {
  connectedAccountId: string;
}): Promise<{ transcriptHistoryRunId: string | null }> => {
  const isTranscriptImportEnabled = isFeatureEnabled({
    isAvailable: FEATURE_FLAGS.IS_TRANSCRIPT_IMPORT_ENABLED,
    settingValue: process.env[TRANSCRIPTS_ENABLED_APPLICATION_VARIABLE_KEY],
  });
  const initialImportKvKey =
    buildTeamsTranscriptHistoryInitialImportKvKey(connectedAccountId);

  if (
    !isTranscriptImportEnabled ||
    isDefined(await kv.get<boolean>(initialImportKvKey))
  ) {
    return { transcriptHistoryRunId: null };
  }

  const state = await startTeamsTranscriptHistoryRunOrThrow({
    connectedAccountId,
    days: TEAMS_TRANSCRIPT_HISTORY_INITIAL_IMPORT_DAYS,
  });

  await kv.set(initialImportKvKey, true);

  if (!(await isTeamsConnectionListed(connectedAccountId))) {
    await deleteTeamsTranscriptHistoryKvKeys({ connectedAccountId });

    return { transcriptHistoryRunId: null };
  }

  return { transcriptHistoryRunId: state.runId };
};
