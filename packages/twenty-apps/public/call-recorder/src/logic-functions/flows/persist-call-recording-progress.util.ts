import { type CoreApiClient } from 'twenty-client-sdk/core';

import { completeAndChargeCallRecording } from 'src/logic-functions/flows/complete-and-charge-call-recording.util';
import { updateCallRecording } from 'src/logic-functions/data/update-call-recording.util';
import { type CallRecordingUpdateFields } from 'src/logic-functions/types/call-recording-update-fields.type';

export const persistCallRecordingProgress = async (
  client: CoreApiClient,
  {
    id,
    current,
    updateData,
    completesImport,
  }: {
    id: string;
    current: { startedAt?: string; endedAt?: string };
    updateData: CallRecordingUpdateFields;
    completesImport: boolean;
  },
): Promise<void> => {
  if (!completesImport) {
    await updateCallRecording(client, { id, data: updateData });

    return;
  }

  // Strip status so COMPLETED is written only by the atomic claim — its single winner bills once.
  const nonStatusUpdate: CallRecordingUpdateFields = { ...updateData };

  delete nonStatusUpdate.status;

  if (Object.keys(nonStatusUpdate).length > 0) {
    await updateCallRecording(client, { id, data: nonStatusUpdate });
  }

  await completeAndChargeCallRecording(client, {
    id,
    startedAt: updateData.startedAt ?? current.startedAt,
    endedAt: updateData.endedAt ?? current.endedAt,
  });
};
