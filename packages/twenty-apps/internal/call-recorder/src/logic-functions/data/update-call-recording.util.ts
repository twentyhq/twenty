import { type CoreApiClient } from 'twenty-client-sdk/core';

import { type CallRecordingRequestStatus } from 'src/logic-functions/constants/call-recording-request-status';
import { type CallRecordingStatus } from 'src/logic-functions/constants/call-recording-status';
import {
  executeCurrentSchemaMutation,
  type CurrentSchemaUpdateCallRecordingMutation,
} from 'src/logic-functions/data/execute-current-schema-mutation.util';

export type CallRecordingUpdateFields = Partial<{
  // null clears a previously synced title when the calendar title disappears.
  title: string | null;
  status: CallRecordingStatus;
  recordingRequestStatus: CallRecordingRequestStatus;
  startedAt: string;
  endedAt: string;
  calendarEventId: string;
  // null clears stale app-owned state on cancel/eject or reschedule.
  externalBotId: string | null;
  externalRecordingId: string;
  callRecorderFailureReason: string | null;
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
  const mutation = {
    updateCallRecording: {
      __args: {
        id,
        data,
      },
      id: true,
    },
  } satisfies CurrentSchemaUpdateCallRecordingMutation;

  await executeCurrentSchemaMutation(client, mutation);
};
