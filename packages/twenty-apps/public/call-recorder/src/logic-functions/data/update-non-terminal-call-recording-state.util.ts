import { isNonEmptyArray } from '@sniptt/guards';
import { type CoreApiClient } from 'twenty-client-sdk/core';

import { NON_TERMINAL_CALL_RECORDING_STATUSES } from 'src/logic-functions/constants/non-terminal-call-recording-statuses';
import { type CallRecordingUpdateFields } from 'src/logic-functions/types/call-recording-update-fields.type';

type CallRecordingStateUpdate = Pick<
  CallRecordingUpdateFields,
  'status' | 'callRecorderFailureReason'
>;

export const updateNonTerminalCallRecordingState = async (
  client: CoreApiClient,
  {
    callRecordingId,
    data,
  }: { callRecordingId: string; data: CallRecordingStateUpdate },
): Promise<boolean> => {
  const updateResult = await client.mutation({
    updateCallRecordings: {
      __args: {
        filter: {
          id: { eq: callRecordingId },
          status: { in: NON_TERMINAL_CALL_RECORDING_STATUSES },
        },
        data,
      },
      id: true,
    },
  });

  return isNonEmptyArray(updateResult.updateCallRecordings);
};
