import { type CoreApiClient } from 'twenty-client-sdk/core';

import { type DeletedAndCompletedCallRecordingIds } from 'src/features/transcripts/logic-functions/types/deleted-and-completed-call-recording-ids.type';
import { type ExistingCallRecording } from 'src/features/transcripts/logic-functions/types/existing-call-recording.type';
import { getDeletedAndCompletedCallRecordingIds } from 'src/features/transcripts/logic-functions/utils/get-deleted-and-completed-call-recording-ids';

export const findDeletedAndCompletedCallRecordingIdsOrThrow = async ({
  coreApiClient,
  callRecordingIds,
  importedSince,
}: {
  coreApiClient: Pick<CoreApiClient, 'query'>;
  callRecordingIds: string[];
  importedSince?: string;
}): Promise<DeletedAndCompletedCallRecordingIds> => {
  if (callRecordingIds.length === 0) {
    return getDeletedAndCompletedCallRecordingIds({ callRecordings: [] });
  }

  const result: {
    callRecordings?: { edges?: { node: ExistingCallRecording }[] };
  } = await coreApiClient.query({
    callRecordings: {
      __args: {
        filter: {
          id: { in: callRecordingIds },
          or: [
            { deletedAt: { is: 'NULL' } },
            { deletedAt: { is: 'NOT_NULL' } },
          ],
        },
        first: callRecordingIds.length,
      },
      edges: {
        node: { id: true, status: true, createdAt: true, deletedAt: true },
      },
    },
  });

  return getDeletedAndCompletedCallRecordingIds({
    callRecordings:
      result.callRecordings?.edges?.map((edge) => edge.node) ?? [],
    importedSince,
  });
};
