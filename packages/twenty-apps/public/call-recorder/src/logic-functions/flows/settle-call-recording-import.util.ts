import { isUndefined } from '@sniptt/guards';
import { type CoreApiClient } from 'twenty-client-sdk/core';

import { findCallRecordingForArtifactsImport } from 'src/logic-functions/data/find-call-recording-for-artifacts-import.util';
import { shouldCompleteCallRecordingImport } from 'src/logic-functions/domain/should-complete-call-recording-import.util';
import { completeAndChargeCallRecording } from 'src/logic-functions/flows/complete-and-charge-call-recording.util';

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
