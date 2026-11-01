import { type CoreApiClient } from 'twenty-client-sdk/core';

import { type TeamsOccurrenceTranscript } from 'src/features/transcripts/logic-functions/types/teams-occurrence-transcript.type';
import { type TeamsTranscriptHistoryPageCounts } from 'src/features/transcripts/logic-functions/types/teams-transcript-history-page-counts.type';
import { computeCallRecordingIdForTeamsTranscript } from 'src/features/transcripts/logic-functions/utils/compute-call-recording-id-for-teams-transcript';
import { findDeletedAndCompletedCallRecordingIdsOrThrow } from 'src/features/transcripts/logic-functions/utils/find-deleted-and-completed-call-recording-ids-or-throw';

export const countTeamsTranscriptHistoryPageOrThrow = async ({
  coreApiClient,
  transcripts,
}: {
  coreApiClient: Pick<CoreApiClient, 'query'>;
  transcripts: TeamsOccurrenceTranscript[];
}): Promise<TeamsTranscriptHistoryPageCounts> => {
  const { deletedCallRecordingIds, completedCallRecordingIds } =
    await findDeletedAndCompletedCallRecordingIdsOrThrow({
      coreApiClient,
      callRecordingIds: transcripts.map(({ transcript }) =>
        computeCallRecordingIdForTeamsTranscript(transcript.id),
      ),
    });

  return {
    transcriptCount: transcripts.length,
    alreadyImportedCount: completedCallRecordingIds.size,
    deletedCount: deletedCallRecordingIds.size,
    importedCount: 0,
    skippedCount: 0,
    unavailableCount: 0,
  };
};
