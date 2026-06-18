import { CoreApiClient } from 'twenty-client-sdk/core';

import { completeCallRecordingIngestion } from 'src/logic-functions/data/complete-call-recording-ingestion.util';
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
  const claimed = await completeCallRecordingIngestion(client, { id });

  if (claimed) {
    await chargeCompletedCallRecording({
      callRecordingId: id,
      startedAt,
      endedAt,
    });
  }

  return claimed;
};
