import { isNonEmptyArray, isUndefined } from '@sniptt/guards';
import { type CoreApiClient } from 'twenty-client-sdk/core';

import { CallRecordingStatus } from 'src/logic-functions/constants/call-recording-status';
import { completeCallRecordingImport } from 'src/logic-functions/data/complete-call-recording-import.util';
import { type CallRecordingForArtifactsImport } from 'src/logic-functions/data/find-call-recording-for-artifacts-import.util';
import { updateCallRecording } from 'src/logic-functions/data/update-call-recording.util';
import { updateNonTerminalCallRecordingState } from 'src/logic-functions/data/update-non-terminal-call-recording-state.util';
import { buildEmptyTranscriptMarker } from 'src/logic-functions/domain/build-empty-transcript-marker.util';
import { parseTranscriptMarker } from 'src/logic-functions/domain/parse-transcript-marker.util';
import { runCallRecordingArtifactImportWithClaim } from 'src/logic-functions/flows/run-call-recording-artifact-import-with-claim.util';

export type SettleStuckCallRecordingOutcome =
  | 'completed'
  | 'failed'
  | 'skipped';

export const settleStuckCallRecording = async ({
  client,
  callRecordingId,
  now,
}: {
  client: CoreApiClient;
  callRecordingId: string;
  now: Date;
}): Promise<SettleStuckCallRecordingOutcome> => {
  const transcriptScopeExecution =
    await runCallRecordingArtifactImportWithClaim({
      client,
      callRecordingId,
      scope: 'transcript',
      now,
      runImport: () =>
        runCallRecordingArtifactImportWithClaim({
          client,
          callRecordingId,
          scope: 'media',
          now,
          runImport: (callRecording) =>
            settleWithImportedArtifacts(client, callRecording),
        }),
    });

  if (transcriptScopeExecution.status === 'skipped') {
    return 'skipped';
  }

  const mediaScopeExecution = transcriptScopeExecution.result;

  return mediaScopeExecution.status === 'skipped'
    ? 'skipped'
    : mediaScopeExecution.result;
};

const settleWithImportedArtifacts = async (
  client: CoreApiClient,
  callRecording: Pick<
    CallRecordingForArtifactsImport,
    'id' | 'status' | 'transcript' | 'audio' | 'video'
  >,
): Promise<SettleStuckCallRecordingOutcome> => {
  if (callRecording.status !== CallRecordingStatus.PROCESSING) {
    return 'skipped';
  }

  const hasImportedMedia =
    isNonEmptyArray(callRecording.audio) ||
    isNonEmptyArray(callRecording.video);

  if (!hasImportedMedia) {
    await updateNonTerminalCallRecordingState(client, {
      callRecordingId: callRecording.id,
      data: {
        status: CallRecordingStatus.FAILED,
        callRecorderFailureReason: 'recording_import_expired',
      },
    });

    return 'failed';
  }

  const transcriptMarker = parseTranscriptMarker(callRecording.transcript);
  const isTranscriptMissing =
    isUndefined(callRecording.transcript) ||
    transcriptMarker?.status === 'PENDING';

  if (isTranscriptMissing) {
    await updateCallRecording(client, {
      id: callRecording.id,
      data: {
        transcript: buildEmptyTranscriptMarker({
          recallTranscriptId: transcriptMarker?.recallTranscriptId ?? null,
        }),
      },
    });
  }

  await completeCallRecordingImport(client, { id: callRecording.id });

  return 'completed';
};
