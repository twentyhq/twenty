import { CoreApiClient } from 'twenty-client-sdk/core';

import { CALL_RECORDING_REQUEST_STATUS } from 'src/logic-functions/constants/call-recording-request-status';
import { CALL_RECORDING_STATUS } from 'src/logic-functions/constants/call-recording-status';

export type ScheduledCallRecordingFields = {
  title: string | null;
  status: typeof CALL_RECORDING_STATUS.SCHEDULED;
  recordingRequestStatus: typeof CALL_RECORDING_REQUEST_STATUS.REQUESTED;
  startedAt: string | null;
  endedAt: string | null;
  calendarEventId: string;
};

export const createCallRecording = async (
  client: CoreApiClient,
  data: ScheduledCallRecordingFields,
): Promise<string> => {
  const mutationResult = await client.mutation({
    createCallRecording: {
      __args: {
        data,
      },
      id: true,
    },
  });
  const createdCallRecordingId = mutationResult.createCallRecording?.id;

  if (createdCallRecordingId === undefined) {
    throw new Error(
      'createCallRecording mutation did not return a call recording id',
    );
  }

  return createdCallRecordingId;
};
