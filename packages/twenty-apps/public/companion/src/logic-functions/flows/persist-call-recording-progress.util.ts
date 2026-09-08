import { CallRecordingStatus } from 'src/logic-functions/constants/call-recording-status';

import { getAllowedPreviousCallRecordingStatuses } from 'src/logic-functions/domain/is-call-recording-status-downgrade.util';
import { type CoreApiClient } from 'twenty-client-sdk/core';

import { completeAndChargeCallRecording } from 'src/logic-functions/flows/complete-and-charge-call-recording.util';
import { updateCallRecording } from 'src/logic-functions/data/update-call-recording.util';
import { type CallRecordingUpdateFields } from 'src/logic-functions/types/call-recording-update-fields.type';

export const persistCallRecordingProgress = async (
  client: CoreApiClient,
  {
    id,
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
    await updateCallRecording(client, {
      id,
      data: updateData,
      expectedStatuses: getAllowedPreviousCallRecordingStatuses(
        updateData.status ?? CallRecordingStatus.PROCESSING,
      ),
    });

    return;
  }

  const { status: _status, ...nonStatusUpdate } = updateData;

  if (Object.keys(nonStatusUpdate).length > 0) {
    const updated = await updateCallRecording(client, {
      id,
      data: nonStatusUpdate,
      expectedStatuses: getAllowedPreviousCallRecordingStatuses(
        CallRecordingStatus.PROCESSING,
      ),
    });
    if (!updated) return;
  }

  await completeAndChargeCallRecording(client, {
    id,
  });
};
