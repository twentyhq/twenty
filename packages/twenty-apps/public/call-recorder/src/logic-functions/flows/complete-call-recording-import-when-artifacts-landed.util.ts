import { isUndefined } from '@sniptt/guards';
import { type CoreApiClient } from 'twenty-client-sdk/core';

import { findCallRecordingForArtifactImport } from 'src/logic-functions/data/find-call-recording-for-artifact-import.util';
import { shouldCompleteCallRecordingImport } from 'src/logic-functions/domain/should-complete-call-recording-import.util';
import { completeAndChargeCallRecording } from 'src/logic-functions/flows/complete-and-charge-call-recording.util';

// The transcript and media imports run as separate jobs, each judging completion
// from the snapshot it read before writing, so neither can see an artifact its
// partner wrote in the meantime. Re-reading after the write gives whichever job
// wrote last a view of both halves, which is what makes it the one that completes.
export const completeCallRecordingImportWhenArtifactsLanded = async (
  client: CoreApiClient,
  { callRecordingId }: { callRecordingId: string },
): Promise<void> => {
  const callRecording = await findCallRecordingForArtifactImport(
    client,
    callRecordingId,
  );

  if (
    isUndefined(callRecording) ||
    !shouldCompleteCallRecordingImport({
      current: callRecording,
      updateData: {},
    })
  ) {
    return;
  }

  await completeAndChargeCallRecording(client, {
    id: callRecording.id,
    startedAt: callRecording.startedAt,
    endedAt: callRecording.endedAt,
  });
};
