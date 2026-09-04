import { type CoreApiClient } from 'twenty-client-sdk/core';

import { type CallRecordingReference } from 'src/logic-functions/types/call-recording-reference.type';
import { chunkIntoBatches } from 'src/utils/chunk-into-batches.util';

const CALL_RECORDING_COMPLETION_BATCH_SIZE = 200;

export const completeFathomCallRecordingImports = async ({
  coreApiClient,
  callRecordings,
}: {
  coreApiClient: Pick<CoreApiClient, 'mutation'>;
  callRecordings: CallRecordingReference[];
}): Promise<number> => {
  let completedCallRecordingCount = 0;

  for (const callRecordingBatch of chunkIntoBatches(
    callRecordings,
    CALL_RECORDING_COMPLETION_BATCH_SIZE,
  )) {
    const mutationResult = await coreApiClient.mutation({
      updateCallRecordings: {
        __args: {
          filter: {
            status: { eq: 'PROCESSING' },
            or: callRecordingBatch.map(({ id, updatedAt }) => ({
              id: { eq: id },
              updatedAt: { eq: updatedAt },
            })),
          },
          data: { status: 'COMPLETED' },
        },
        id: true,
      },
    });

    completedCallRecordingCount +=
      mutationResult.updateCallRecordings?.length ?? 0;
  }

  return completedCallRecordingCount;
};
