import { type CoreApiClient } from 'twenty-client-sdk/core';

import { chargeCredits } from 'twenty-sdk/billing';
import { computeCallRecordingCharge } from 'src/logic-functions/domain/compute-call-recording-charge.util';
import { getOwnedDesktopUpload } from 'src/logic-functions/recall-api/get-owned-desktop-upload.util';
import { getRecallRecording } from 'src/logic-functions/recall-api/get-recall-recording.util';
import { normalizeRecallTimestamp } from 'src/logic-functions/recall-api/normalize-recall-timestamp.util';
import { getString } from 'src/logic-functions/utils/get-string.util';

export const chargeCompletedCallRecording = async (
  client: CoreApiClient,
  { callRecordingId }: { callRecordingId: string },
): Promise<void> => {
  const result = await client.query({
    callRecordings: {
      __args: { first: 1, filter: { id: { eq: callRecordingId } } },
      edges: {
        node: {
          id: true,
          status: true,
          companionSession: true,
          externalRecordingId: true,
        },
      },
    },
  });
  const recording = result.callRecordings?.edges?.[0]?.node;
  if (!recording || recording.status !== 'COMPLETED') return;

  const upload = await getOwnedDesktopUpload(recording);
  if (
    !upload ||
    upload.status.code !== 'complete' ||
    !upload.recording_id ||
    upload.recording_id !== recording.externalRecordingId
  ) {
    throw new Error(
      'Cannot bill a recording that does not match its owned desktop upload.',
    );
  }
  const providerResult = await getRecallRecording({
    externalRecordingId: upload.recording_id,
  });
  if (!providerResult.ok) throw new Error('Recording duration is unavailable.');
  // CRM timestamps are editable; only the completed provider recording determines usage.
  const charge = computeCallRecordingCharge({
    startedAt: normalizeRecallTimestamp(
      getString(providerResult.recording.started_at),
    ),
    endedAt: normalizeRecallTimestamp(
      getString(providerResult.recording.completed_at),
    ),
  });
  if (!charge) throw new Error('Recording has no usable provider duration.');

  await chargeCredits({
    creditsUsedMicro: charge.creditsUsedMicro,
    quantity: charge.quantityMinutes,
    operationType: 'CALL_RECORDING',
    resourceContext: 'recall',
  });
};
