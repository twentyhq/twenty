import { type CoreApiClient } from 'twenty-client-sdk/core';
import { completeCallRecordingImport } from 'src/logic-functions/data/utils/completeCallRecordingImport';
import { chargeCredits } from 'twenty-sdk/billing';
import { getCallRecordingCharge } from 'src/logic-functions/flows/utils/getCallRecordingCharge';

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
