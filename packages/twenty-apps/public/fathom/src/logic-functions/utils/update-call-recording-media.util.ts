import { type CoreApiClient } from 'twenty-client-sdk/core';

import { type CallRecordingSyncFields } from 'src/logic-functions/types/call-recording-sync-fields.type';
import { type FathomMediaWriteContext } from 'src/logic-functions/types/fathom-media-write-context.type';
import { buildFathomMediaWriteFence } from 'src/logic-functions/utils/build-fathom-media-write-fence.util';

export const updateCallRecordingMedia = async ({
  coreApiClient,
  callRecordingId,
  fields,
  writeContext,
}: {
  coreApiClient: Pick<CoreApiClient, 'mutation'>;
  callRecordingId: string;
  writeContext: FathomMediaWriteContext;
  fields: Pick<CallRecordingSyncFields, 'video' | 'audio'>;
}): Promise<boolean> => {
  const result = await coreApiClient.mutation({
    updateCallRecordings: {
      __args: {
        filter: {
          id: { eq: callRecordingId },
          fathomRecordingImports: buildFathomMediaWriteFence(writeContext),
        },
        data: fields,
      },
      id: true,
    },
  });

  return (result.updateCallRecordings ?? []).length > 0;
};
