import { type CoreApiClient } from 'twenty-client-sdk/core';

import { CallRecordingStatus } from 'src/logic-functions/constants/call-recording-status';
import { completeCallRecordingImport } from 'src/logic-functions/data/complete-call-recording-import.util';
import { updateCallRecording } from 'src/logic-functions/data/update-call-recording.util';
import { chargeCompletedCallRecording } from 'src/logic-functions/flows/charge-completed-call-recording.util';

export const completeAndChargeCallRecording = async (
  client: CoreApiClient,
  {
    id,
    startedAt,
    endedAt,
  }: {
    id: string;
    startedAt: string | undefined;
    endedAt: string | undefined;
  },
): Promise<boolean> => {
  const claimed = await completeCallRecordingImport(client, { id });

  if (!claimed) {
    return false;
  }

  const chargeOutcome = await chargeCompletedCallRecording({
    callRecordingId: id,
    startedAt,
    endedAt,
  });

  // Ambiguous outcomes stay completed because retrying could double-charge.
  if (chargeOutcome === 'rejected') {
    await updateCallRecording(client, {
      id,
      data: { status: CallRecordingStatus.PROCESSING },
    });

    return false;
  }

  return true;
};
