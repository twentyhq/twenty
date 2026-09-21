import { type CoreApiClient } from 'twenty-client-sdk/core';

import { CallRecordingRequestStatus } from 'src/logic-functions/constants/call-recording-request-status';
import { CallRecordingStatus } from 'src/logic-functions/constants/call-recording-status';

const CALL_RECORDING_UPDATE_BATCH_SIZE = 200;

export const cancelOpenScheduledCallRecordingRequests = async (
  coreApiClient: CoreApiClient,
  callRecordingIds: string[],
  shouldStartBatchRequest: () => boolean,
): Promise<number> => {
  const uniqueCallRecordingIds = [...new Set(callRecordingIds)];
  let canceledCallRecordingRequestCount = 0;
  const batchErrors: unknown[] = [];

  for (
    let batchStartIndex = 0;
    batchStartIndex < uniqueCallRecordingIds.length;
    batchStartIndex += CALL_RECORDING_UPDATE_BATCH_SIZE
  ) {
    if (!shouldStartBatchRequest()) {
      batchErrors.push(
        new Error(
          'call recording update request cutoff reached before all batches were attempted',
        ),
      );

      break;
    }

    const callRecordingIdBatch = uniqueCallRecordingIds.slice(
      batchStartIndex,
      batchStartIndex + CALL_RECORDING_UPDATE_BATCH_SIZE,
    );
    try {
      const updateCallRecordingsResult = await coreApiClient.mutation({
        updateCallRecordings: {
          __args: {
            filter: {
              id: { in: callRecordingIdBatch },
              recordingRequestStatus: {
                eq: CallRecordingRequestStatus.REQUESTED,
              },
              status: { eq: CallRecordingStatus.SCHEDULED },
            },
            data: {
              recordingRequestStatus: CallRecordingRequestStatus.CANCELED,
            },
          },
          id: true,
        },
      });

      canceledCallRecordingRequestCount += (
        updateCallRecordingsResult.updateCallRecordings ?? []
      ).length;
    } catch (error) {
      batchErrors.push(error);
    }
  }

  if (batchErrors.length > 0) {
    const totalBatchCount = Math.ceil(
      uniqueCallRecordingIds.length / CALL_RECORDING_UPDATE_BATCH_SIZE,
    );

    throw new Error(
      `${batchErrors.length} of ${totalBatchCount} call recording update batches failed: ${batchErrors
        .map((batchError) =>
          batchError instanceof Error ? batchError.message : String(batchError),
        )
        .join('; ')}`,
    );
  }

  return canceledCallRecordingRequestCount;
};
