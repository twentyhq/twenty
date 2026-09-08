import { type CoreApiClient } from 'twenty-client-sdk/core';

import { completeCallRecordingImport } from 'src/logic-functions/data/complete-call-recording-import.util';
import { chargeCompletedCallRecording } from 'src/logic-functions/flows/charge-completed-call-recording.util';

export const completeAndChargeCallRecording = async (
  client: CoreApiClient,
  { id }: { id: string },
): Promise<boolean> => {
  const completed = await completeCallRecordingImport(client, { id });
  if (completed) {
    await chargeCompletedCallRecording(client, { callRecordingId: id });
  }
  return completed;
};
