import { isUndefined } from '@sniptt/guards';
import { type CoreApiClient } from 'twenty-client-sdk/core';

import { type CallRecordingRequestStatus } from 'src/logic-functions/constants/call-recording-request-status';
import { type CallRecordingStatus } from 'src/logic-functions/constants/call-recording-status';

export type ScheduledCallRecordingFields = {
  title: string | null;
  status: CallRecordingStatus.SCHEDULED;
  recordingRequestStatus: CallRecordingRequestStatus.REQUESTED;
  calendarEventId: string;
};

export const createCallRecording = async (
  client: CoreApiClient,
  {
    id,
    data,
  }: {
    id: string;
    data: ScheduledCallRecordingFields;
  },
): Promise<string> => {
  const mutationResult = await client.mutation({
    createCallRecording: {
      __args: {
        data: { id, ...data },
      },
      id: true,
    },
  });
  const createdCallRecordingId = mutationResult.createCallRecording?.id;

  if (isUndefined(createdCallRecordingId)) {
    throw new Error(
      'createCallRecording mutation did not return a call recording id',
    );
  }

  return createdCallRecordingId;
};
