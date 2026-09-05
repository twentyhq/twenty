import { type CoreApiClient } from 'twenty-client-sdk/core';

import { type FathomMediaImportClaim } from 'src/logic-functions/utils/claim-fathom-media-import.util';

export const releaseFathomMediaImportClaim = async ({
  coreApiClient,
  callRecordingId,
  claim,
}: {
  coreApiClient: Pick<CoreApiClient, 'mutation'>;
  callRecordingId: string;
  claim: FathomMediaImportClaim;
}): Promise<void> => {
  await coreApiClient.mutation({
    updateCallRecordings: {
      __args: {
        filter: {
          id: { eq: callRecordingId },
          fathomMediaImportClaimedAt: { eq: claim.claimedAt },
        },
        data: { fathomMediaImportClaimedAt: null },
      },
      id: true,
    },
  });
};
