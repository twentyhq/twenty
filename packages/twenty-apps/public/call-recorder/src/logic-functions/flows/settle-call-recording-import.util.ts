import { isUndefined } from '@sniptt/guards';
import { type CoreApiClient } from 'twenty-client-sdk/core';

import { findCallRecordingForArtifactsImport } from 'src/logic-functions/data/find-call-recording-for-artifacts-import.util';
import { updateNonTerminalCallRecordingState } from 'src/logic-functions/data/update-non-terminal-call-recording-state.util';
import { buildFailedCallRecordingImportUpdate } from 'src/logic-functions/domain/build-failed-call-recording-import-update.util';
import { shouldCompleteCallRecordingImport } from 'src/logic-functions/domain/should-complete-call-recording-import.util';
import { completeAndChargeCallRecording } from 'src/logic-functions/flows/complete-and-charge-call-recording.util';

export type SettleCallRecordingImportOutcome =
  | 'completed'
  | 'failed'
  | 'pending';

export const settleCallRecordingImport = async (
  client: CoreApiClient,
  { callRecordingId }: { callRecordingId: string },
): Promise<SettleCallRecordingImportOutcome> => {
  const callRecording = await findCallRecordingForArtifactsImport(
    client,
    callRecordingId,
  );

  if (isUndefined(callRecording)) {
    return 'pending';
  }

  const failedImportUpdate =
    buildFailedCallRecordingImportUpdate(callRecording);

  if (!isUndefined(failedImportUpdate)) {
    const hasFailed = await updateNonTerminalCallRecordingState(client, {
      callRecordingId: callRecording.id,
      data: failedImportUpdate,
    });

    return hasFailed ? 'failed' : 'pending';
  }

  if (!shouldCompleteCallRecordingImport(callRecording)) {
    return 'pending';
  }

  const hasCompleted = await completeAndChargeCallRecording(client, {
    id: callRecording.id,
    startedAt: callRecording.startedAt,
    endedAt: callRecording.endedAt,
  });

  return hasCompleted ? 'completed' : 'pending';
};
