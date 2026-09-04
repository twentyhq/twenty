import { type CoreApiClient } from 'twenty-client-sdk/core';

import { type CallRecordingSyncFields } from 'src/logic-functions/types/call-recording-sync-fields.type';
import { type FathomMediaWriteContext } from 'src/logic-functions/types/fathom-media-write-context.type';
import { isDefined } from 'src/utils/is-defined';

export const updateCallRecordingMedia = async ({
  coreApiClient,
  callRecordingId,
  fields,
  writeContext,
}: {
  coreApiClient: Pick<CoreApiClient, 'mutation'>;
  callRecordingId: string;
  writeContext: FathomMediaWriteContext;
  fields: Pick<
    CallRecordingSyncFields,
    | 'video'
    | 'audio'
    | 'fathomMediaFailureReason'
    | 'fathomMediaDownloadId'
    | 'fathomMediaUploadCheckpoint'
  >;
}): Promise<boolean> => {
  const result = await coreApiClient.mutation({
    updateCallRecordings: {
      __args: {
        filter: {
          id: { eq: callRecordingId },
          fathomConnectedAccountId: { eq: writeContext.connectedAccountId },
          fathomMediaImportClaimedAt: { eq: writeContext.claimedAt },
          fathomMediaDownloadId: isDefined(writeContext.downloadId)
            ? { eq: writeContext.downloadId }
            : { is: 'NULL' },
        },
        data: fields,
      },
      id: true,
    },
  });

  return (result.updateCallRecordings ?? []).length > 0;
};
