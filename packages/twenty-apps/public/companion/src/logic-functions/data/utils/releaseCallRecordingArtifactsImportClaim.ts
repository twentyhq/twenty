import { type CoreApiClient } from 'twenty-client-sdk/core';

export const releaseCallRecordingArtifactsImportClaim = async (
  client: Pick<CoreApiClient, 'mutation'>,
  { callRecordingId, claimedAt }: { callRecordingId: string; claimedAt: Date },
): Promise<void> => {
  await client.mutation({
    updateCallRecordings: {
      __args: {
        filter: {
          id: { eq: callRecordingId },
          companionImportClaimedAt: { eq: claimedAt.toISOString() },
        },
        data: { companionImportClaimedAt: null },
      },
      id: true,
    },
  });
};
