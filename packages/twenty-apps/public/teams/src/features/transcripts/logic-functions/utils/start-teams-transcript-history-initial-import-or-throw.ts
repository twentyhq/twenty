import { kv } from 'twenty-sdk/logic-function';
import { isDefined } from 'twenty-sdk/utils';

import { TEAMS_TRANSCRIPT_HISTORY_INITIAL_IMPORT_DAYS } from 'src/features/transcripts/constants/teams-transcript-history-initial-import-days';
import { type TeamsTranscriptHistoryState } from 'src/features/transcripts/logic-functions/types/teams-transcript-history-state.type';
import { buildTeamsTranscriptHistoryInitialImportKvKey } from 'src/features/transcripts/logic-functions/utils/build-teams-transcript-history-initial-import-kv-key';
import { buildTeamsTranscriptHistoryKvKey } from 'src/features/transcripts/logic-functions/utils/build-teams-transcript-history-kv-key';
import { deleteTeamsTranscriptHistoryKvKeys } from 'src/features/transcripts/logic-functions/utils/delete-teams-transcript-history-kv-keys';
import { isTeamsConnectionListed } from 'src/features/transcripts/logic-functions/utils/is-teams-connection-listed';
import { isTeamsTranscriptHistoryStalled } from 'src/features/transcripts/logic-functions/utils/is-teams-transcript-history-stalled';
import { startTeamsTranscriptHistoryRunOrThrow } from 'src/features/transcripts/logic-functions/utils/start-teams-transcript-history-run-or-throw';
import { isTeamsTranscriptImportEnabled } from 'src/features/transcripts/logic-functions/utils/is-teams-transcript-import-enabled';

export const startTeamsTranscriptHistoryInitialImportOrThrow = async ({
  connectedAccountId,
}: {
  connectedAccountId: string;
}): Promise<void> => {
  if (!isTeamsTranscriptImportEnabled()) {
    return;
  }

  const initialImportKvKey =
    buildTeamsTranscriptHistoryInitialImportKvKey(connectedAccountId);
  const [hasStartedInitialImport, existingState] = await Promise.all([
    kv.get<boolean>(initialImportKvKey),
    kv.get<TeamsTranscriptHistoryState>(
      buildTeamsTranscriptHistoryKvKey(connectedAccountId),
    ),
  ]);

  if (
    isDefined(hasStartedInitialImport) &&
    isDefined(existingState) &&
    (existingState.phase !== 'failed' ||
      existingState.errorCode === 'page-limit-reached') &&
    !isTeamsTranscriptHistoryStalled({ state: existingState, now: Date.now() })
  ) {
    return;
  }

  await startTeamsTranscriptHistoryRunOrThrow({
    connectedAccountId,
    days: TEAMS_TRANSCRIPT_HISTORY_INITIAL_IMPORT_DAYS,
    phase: 'importing',
  });
  await kv.set(initialImportKvKey, true);

  if (!(await isTeamsConnectionListed(connectedAccountId))) {
    await deleteTeamsTranscriptHistoryKvKeys({ connectedAccountId });
  }
};
