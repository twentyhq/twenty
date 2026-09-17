import { type CoreApiClient } from 'twenty-client-sdk/core';
import { computeCallRecordingCharge } from 'src/logic-functions/domain/utils/computeCallRecordingCharge';
import { getOwnedDesktopUpload } from 'src/logic-functions/recall-api/utils/getOwnedDesktopUpload';
import { getRecallRecording } from 'src/logic-functions/recall-api/utils/getRecallRecording';
import { normalizeRecallTimestamp } from 'src/logic-functions/recall-api/utils/normalizeRecallTimestamp';
import { getString } from 'src/logic-functions/utils/getString';

export const getCallRecordingCharge = async (
  client: CoreApiClient,
  { callRecordingId }: { callRecordingId: string },
) => {
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
  if (
    !recording ||
    ['COMPLETED', 'FAILED', 'NOT_RECORDED'].includes(recording.status)
  )
    return null;

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

  return {
    creditsUsedMicro: charge.creditsUsedMicro,
    quantity: charge.quantityMinutes,
    operationType: 'CALL_RECORDING' as const,
    resourceContext: 'recall',
  };
};
