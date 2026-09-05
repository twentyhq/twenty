import { type CoreApiClient } from 'twenty-client-sdk/core';

import { FATHOM_MEDIA_IMPORT_CLAIM_DURATION_MILLISECONDS } from 'src/constants/fathom.constant';

export type FathomMediaImportClaim = {
  claimedAt: string;
};

export const claimFathomMediaImport = async ({
  coreApiClient,
  callRecordingId,
  now,
}: {
  coreApiClient: Pick<CoreApiClient, 'mutation'>;
  callRecordingId: string;
  now: Date;
}): Promise<FathomMediaImportClaim | undefined> => {
  const claimedAt = now.toISOString();
  const staleBefore = new Date(
    now.getTime() - FATHOM_MEDIA_IMPORT_CLAIM_DURATION_MILLISECONDS,
  ).toISOString();
  const mutationResult = await coreApiClient.mutation({
    updateCallRecordings: {
      __args: {
        filter: {
          id: { eq: callRecordingId },
          or: [
            { fathomMediaImportClaimedAt: { is: 'NULL' } },
            { fathomMediaImportClaimedAt: { lte: staleBefore } },
          ],
        },
        data: { fathomMediaImportClaimedAt: claimedAt },
      },
      id: true,
    },
  });

  return (mutationResult.updateCallRecordings ?? []).length === 0
    ? undefined
    : { claimedAt };
};
