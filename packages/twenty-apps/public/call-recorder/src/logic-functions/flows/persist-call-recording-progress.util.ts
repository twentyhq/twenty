import { type CoreApiClient } from 'twenty-client-sdk/core';

import { type FilesFieldValue } from 'src/logic-functions/types/files-field-value.type';
import { completeAndChargeCallRecording } from 'src/logic-functions/flows/complete-and-charge-call-recording.util';
import { shouldCompleteCallRecordingIngestion } from 'src/logic-functions/domain/should-complete-call-recording-ingestion.util';
import { updateCallRecording } from 'src/logic-functions/data/update-call-recording.util';
import { type CallRecordingUpdateFields } from 'src/logic-functions/types/call-recording-update-fields.type';

type PersistCallRecordingProgressCurrent = {
  status?: string;
  startedAt?: string;
  endedAt?: string;
  transcript?: unknown;
  audio?: FilesFieldValue;
  video?: FilesFieldValue;
};

export const persistCallRecordingProgress = async (
  client: CoreApiClient,
  {
    id,
    current,
    updateData,
  }: {
    id: string;
    current: PersistCallRecordingProgressCurrent;
    updateData: CallRecordingUpdateFields;
  },
): Promise<{ completesIngestion: boolean }> => {
  const completesIngestion = shouldCompleteCallRecordingIngestion({
    current,
    updateData,
  });

  if (!completesIngestion) {
    await updateCallRecording(client, { id, data: updateData });

    return { completesIngestion: false };
  }

  // Strip status so COMPLETED is written only by the atomic claim — its single winner bills once.
  const nonStatusUpdate: CallRecordingUpdateFields = { ...updateData };

  delete nonStatusUpdate.status;
  delete nonStatusUpdate.callRecorderFailureReason;

  if (Object.keys(nonStatusUpdate).length > 0) {
    await updateCallRecording(client, { id, data: nonStatusUpdate });
  }

  await completeAndChargeCallRecording(client, {
    id,
    startedAt: updateData.startedAt ?? current.startedAt,
    endedAt: updateData.endedAt ?? current.endedAt,
  });

  return { completesIngestion: true };
};
