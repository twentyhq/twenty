import { kv } from 'twenty-sdk/logic-function';

import { buildTeamsTranscriptHistoryKvKey } from 'src/features/transcripts/logic-functions/utils/build-teams-transcript-history-kv-key';

export const deleteTeamsTranscriptHistoryKvKeys = async ({
  connectedAccountId,
}: {
  connectedAccountId: string;
}): Promise<void> => {
  await kv.delete(buildTeamsTranscriptHistoryKvKey(connectedAccountId));
};
