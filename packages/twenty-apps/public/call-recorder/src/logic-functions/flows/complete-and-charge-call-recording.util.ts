import { type CoreApiClient } from 'twenty-client-sdk/core';

import { completeCallRecordingImport } from 'src/logic-functions/data/complete-call-recording-import.util';
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

  if (claimed) {
    await chargeCompletedCallRecording({
      callRecordingId: id,
      startedAt,
      endedAt,
    });
  }

  return claimed;
};
