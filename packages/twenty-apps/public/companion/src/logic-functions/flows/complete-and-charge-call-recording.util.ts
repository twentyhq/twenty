import { type CoreApiClient } from 'twenty-client-sdk/core';

import { completeCallRecordingImport } from 'src/logic-functions/data/complete-call-recording-import.util';
import { chargeCredits } from 'twenty-sdk/billing';
import { getCallRecordingCharge } from 'src/logic-functions/flows/get-call-recording-charge.util';

export const completeAndChargeCallRecording = async (
  client: CoreApiClient,
  { id }: { id: string },
): Promise<boolean> => {
  const charge = await getCallRecordingCharge(client, { callRecordingId: id });
  if (!charge) return false;
  const completed = await completeCallRecordingImport(client, { id });
  if (completed) {
    await chargeCredits(charge);
  }
  return completed;
};
