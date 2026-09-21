import { isUndefined } from '@sniptt/guards';
import { type CoreApiClient } from 'twenty-client-sdk/core';

import { findCallRecordingForArtifactsImport } from 'src/logic-functions/data/find-call-recording-for-artifacts-import.util';
import { updateNonTerminalCallRecordingState } from 'src/logic-functions/data/update-non-terminal-call-recording-state.util';
import { buildFailedCallRecordingImportUpdate } from 'src/logic-functions/domain/build-failed-call-recording-import-update.util';
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

  if (isUndefined(callRecording)) {
    return false;
  }

  const failedImportUpdate =
    buildFailedCallRecordingImportUpdate(callRecording);

  if (!isUndefined(failedImportUpdate)) {
    return updateNonTerminalCallRecordingState(client, {
      callRecordingId: callRecording.id,
      data: failedImportUpdate,
    });
  }

  if (!shouldCompleteCallRecordingImport(callRecording)) {
    return false;
  }

  return completeAndChargeCallRecording(client, {
    id: callRecording.id,
    startedAt: callRecording.startedAt,
    endedAt: callRecording.endedAt,
  });
};
