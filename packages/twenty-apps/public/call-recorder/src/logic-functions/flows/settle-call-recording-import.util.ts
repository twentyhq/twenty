import { isUndefined } from '@sniptt/guards';
import { type CoreApiClient } from 'twenty-client-sdk/core';

import { findCallRecordingForArtifactsImport } from 'src/logic-functions/data/find-call-recording-for-artifacts-import.util';
import { shouldCompleteCallRecordingImport } from 'src/logic-functions/domain/should-complete-call-recording-import.util';
import { completeAndChargeCallRecording } from 'src/logic-functions/flows/complete-and-charge-call-recording.util';

// Transcript and media are imported by separate jobs, so no single job knows
// whether the recording is finished: it only knows the half it just wrote. This
// runs after that write and judges completion from what the record now holds,
// which makes whichever job wrote last the one that completes it.
export const settleCallRecordingImport = async (
  client: CoreApiClient,
  { callRecordingId }: { callRecordingId: string },
): Promise<boolean> => {
  const callRecording = await findCallRecordingForArtifactsImport(
    client,
    callRecordingId,
  );

  if (
    isUndefined(callRecording) ||
    !shouldCompleteCallRecordingImport(callRecording)
  ) {
    return false;
  }

  return completeAndChargeCallRecording(client, {
    id: callRecording.id,
    startedAt: callRecording.startedAt,
    endedAt: callRecording.endedAt,
  });
};
