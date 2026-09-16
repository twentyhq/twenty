import { CallRecordingStatus } from 'src/logic-functions/constants/CallRecordingStatus';
import { getAllowedPreviousCallRecordingStatuses } from 'src/logic-functions/domain/utils/getAllowedPreviousCallRecordingStatuses';
import { type CoreApiClient } from 'twenty-client-sdk/core';
import { completeAndChargeCallRecording } from 'src/logic-functions/flows/utils/completeAndChargeCallRecording';
import { updateCallRecording } from 'src/logic-functions/data/utils/updateCallRecording';
import { type CallRecordingUpdateFields } from 'src/logic-functions/types/CallRecordingUpdateFields';

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
