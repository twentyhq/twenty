import { type CoreApiClient } from 'twenty-client-sdk/core';

import { postRecordingCharge } from 'src/logic-functions/data/post-recording-charge.util';
import { computeCallRecordingCharge } from 'src/logic-functions/domain/compute-call-recording-charge.util';
import { getOwnedDesktopUpload } from 'src/logic-functions/recall-api/get-owned-desktop-upload.util';
import { getRecallRecording } from 'src/logic-functions/recall-api/get-recall-recording.util';
import { normalizeRecallTimestamp } from '@twentyhq/recall-utils/recall-api/normalize-recall-timestamp.util';
import { asRecord } from '@twentyhq/recall-utils/utils/as-record.util';
import { getString } from '@twentyhq/recall-utils/utils/get-string.util';

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
          companionBillingState: true,
          externalRecordingId: true,
        },
      },
    },
  });
  const recording = result.callRecordings?.edges?.[0]?.node;
  if (
    !recording ||
    recording.status !== 'COMPLETED' ||
    asRecord(recording.companionBillingState)?.status !== 'PENDING'
  )
    return;

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
  if (!providerResult.ok)
    throw new Error(
      'Recording duration is unavailable; billing remains pending.',
    );
  // CRM timestamps are editable; only the completed provider recording determines usage.
  const charge = computeCallRecordingCharge({
    startedAt: normalizeRecallTimestamp(
      getString(providerResult.recording.started_at),
    ),
    endedAt: normalizeRecallTimestamp(
      getString(providerResult.recording.completed_at),
    ),
  });
  if (!charge)
    throw new Error(
      'Recording has no usable provider duration; billing remains pending.',
    );

  const billingState = await postRecordingCharge(callRecordingId, charge);
  await client.mutation({
    updateCallRecordings: {
      __args: {
        filter: { id: { eq: callRecordingId }, status: { eq: 'COMPLETED' } },
        data: { companionBillingState: billingState },
      },
      id: true,
    },
  });
};
