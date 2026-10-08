import { type CoreApiClient } from 'twenty-client-sdk/core';

import { FATHOM_MEDIA_IMPORT_CLAIM_DURATION_MILLISECONDS } from 'src/constants/fathom.constant';

export type FathomMediaImportClaim = {
  claimedAt: string;
};

export const claimFathomMediaImport = async ({
  coreApiClient,
  fathomRecordingImportId,
  now,
}: {
  coreApiClient: Pick<CoreApiClient, 'mutation'>;
  fathomRecordingImportId: string;
  now: Date;
}): Promise<FathomMediaImportClaim | undefined> => {
  const claimedAt = now.toISOString();
  const staleBefore = new Date(
    now.getTime() - FATHOM_MEDIA_IMPORT_CLAIM_DURATION_MILLISECONDS,
  ).toISOString();
  const mutationResult = await coreApiClient.mutation({
    updateFathomRecordingImports: {
      __args: {
        filter: {
          id: { eq: fathomRecordingImportId },
          or: [
            { mediaImportClaimedAt: { is: 'NULL' } },
            { mediaImportClaimedAt: { lte: staleBefore } },
          ],
        },
        data: { mediaImportClaimedAt: claimedAt },
      },
      id: true,
    },
  });

  return (mutationResult.updateFathomRecordingImports ?? []).length === 0
    ? undefined
    : { claimedAt };
};
