import { CoreApiClient } from 'twenty-client-sdk/core';

import { CallRecordingRequestStatus } from 'src/logic-functions/constants/call-recording-request-status';
import { CallRecordingStatus } from 'src/logic-functions/constants/call-recording-status';

export type ScheduledCallRecordingFields = {
  title: string | null;
  status: CallRecordingStatus.SCHEDULED;
  recordingRequestStatus: CallRecordingRequestStatus.REQUESTED;
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
