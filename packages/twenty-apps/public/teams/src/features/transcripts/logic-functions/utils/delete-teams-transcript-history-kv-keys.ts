import { kv } from 'twenty-sdk/logic-function';

import { buildTeamsTranscriptHistoryInitialImportKvKey } from 'src/features/transcripts/logic-functions/utils/build-teams-transcript-history-initial-import-kv-key';
import { buildTeamsTranscriptHistoryKvKey } from 'src/features/transcripts/logic-functions/utils/build-teams-transcript-history-kv-key';

export const deleteTeamsTranscriptHistoryKvKeys = async ({
  connectedAccountId,
}: {
  connectedAccountId: string;
}): Promise<void> => {
  await Promise.all([
    kv.delete(buildTeamsTranscriptHistoryKvKey(connectedAccountId)),
    kv.delete(
      buildTeamsTranscriptHistoryInitialImportKvKey(connectedAccountId),
    ),
  ]);
};
