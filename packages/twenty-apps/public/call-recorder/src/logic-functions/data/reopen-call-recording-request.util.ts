import { type CoreApiClient } from 'twenty-client-sdk/core';

import { CallRecordingStatus } from 'src/logic-functions/constants/call-recording-status';
import { UNAVAILABLE_CALL_RECORDING_STATUSES } from 'src/logic-functions/constants/unavailable-call-recording-statuses';
import { type ScheduledCallRecordingFields } from 'src/logic-functions/data/create-call-recording.util';

// A live or finished bot lifecycle must never be reset to SCHEDULED.
const REOPENABLE_CALL_RECORDING_STATUSES = [
  CallRecordingStatus.SCHEDULED,
  ...UNAVAILABLE_CALL_RECORDING_STATUSES,
];

export const reopenCallRecordingRequest = async (
  client: CoreApiClient,
  {
    callRecordingId,
    scheduledFields,
  }: {
    callRecordingId: string;
    scheduledFields: ScheduledCallRecordingFields;
  },
): Promise<boolean> => {
  const result = await client.mutation({
    updateCallRecordings: {
      __args: {
        filter: {
          id: { eq: callRecordingId },
          status: { in: REOPENABLE_CALL_RECORDING_STATUSES },
        },
        data: { ...scheduledFields, callRecorderFailureReason: null },
      },
      id: true,
    },
  });

  return (result.updateCallRecordings ?? []).length > 0;
};
