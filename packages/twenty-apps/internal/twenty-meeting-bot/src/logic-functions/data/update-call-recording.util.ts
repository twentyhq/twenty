import { CoreApiClient } from 'twenty-client-sdk/core';

import { type CallRecordingRequestStatus } from 'src/logic-functions/constants/call-recording-request-status';
import { type CallRecordingStatus } from 'src/logic-functions/constants/call-recording-status';

export type CallRecordingUpdateFields = Partial<{
  // null clears a previously synced title when the calendar title disappears.
  title: string | null;
  status: CallRecordingStatus;
  recordingRequestStatus: CallRecordingRequestStatus;
  startedAt: string;
  endedAt: string;
  calendarEventId: string;
  // null clears the field on cancel/eject; the only field we ever write null to.
  externalBotId: string | null;
  externalRecordingId: string;
  transcript: Record<string, unknown>;
  audio: { fileId: string; label: string }[];
  video: { fileId: string; label: string }[];
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
