import { type CoreApiClient } from 'twenty-client-sdk/core';

import { type FathomMediaImportClaim } from 'src/logic-functions/utils/claim-fathom-media-import.util';

export const releaseFathomMediaImportClaim = async ({
  coreApiClient,
  fathomRecordingImportId,
  claim,
}: {
  coreApiClient: Pick<CoreApiClient, 'mutation'>;
  fathomRecordingImportId: string;
  claim: FathomMediaImportClaim;
}): Promise<void> => {
  await coreApiClient.mutation({
    updateFathomRecordingImports: {
      __args: {
        filter: {
          id: { eq: fathomRecordingImportId },
          mediaImportClaimedAt: { eq: claim.claimedAt },
        },
        data: { mediaImportClaimedAt: null },
      },
      id: true,
    },
  });
};
