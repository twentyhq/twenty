import { CoreApiClient } from 'twenty-client-sdk/core';

import { type CallRecordingRequestStatus } from 'src/logic-functions/constants/call-recording-request-status';
import { type CallRecordingStatus } from 'src/logic-functions/constants/call-recording-status';

export type CallRecordingUpdateFields = Partial<{
  title: string | null;
  status: CallRecordingStatus;
  recordingRequestStatus: CallRecordingRequestStatus;
  startedAt: string | null;
  endedAt: string | null;
  calendarEventId: string;
  externalBotId: string | null;
  externalRecordingId: string | null;
  // RAW_JSON accepts any JSON; the generated input under-models it, callers cast.
  transcript: Record<string, unknown> | null;
}>;

export const updateCallRecording = async (
  client: CoreApiClient,
  {
    id,
    data,
  }: {
    id: string;
    data: CallRecordingUpdateFields;
  },
): Promise<void> => {
  await client.mutation({
    updateCallRecording: {
      __args: {
        id,
        data,
      },
      id: true,
    },
  });
};
