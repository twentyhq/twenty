import { type CoreApiClient } from 'twenty-client-sdk/core';

import { settleCallRecordingMedia } from 'src/logic-functions/utils/settle-call-recording-media.util';
import { type FathomMediaWriteContext } from 'src/logic-functions/types/fathom-media-write-context.type';

export const recordFathomMediaFailure = async ({
  coreApiClient,
  callRecordingId,
  reason,
  writeContext,
}: {
  coreApiClient: Pick<CoreApiClient, 'query' | 'mutation'>;
  callRecordingId: string;
  reason: string;
  writeContext: FathomMediaWriteContext;
}): Promise<boolean> => {
  return settleCallRecordingMedia({
    coreApiClient,
    callRecordingId,
    writeContext,
    fields: { fathomMediaFailureReason: reason },
  });
};
