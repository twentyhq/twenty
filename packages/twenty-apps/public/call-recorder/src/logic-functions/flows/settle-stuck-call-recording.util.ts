import { isNonEmptyArray, isUndefined } from '@sniptt/guards';
import { type CoreApiClient } from 'twenty-client-sdk/core';

import { CallRecordingStatus } from 'src/logic-functions/constants/call-recording-status';
import {
  AUDIO_IMPORT_EXPIRED_FAILURE_REASON,
  RECORDING_IMPORT_EXPIRED_FAILURE_REASON,
  VIDEO_IMPORT_EXPIRED_FAILURE_REASON,
} from 'src/logic-functions/constants/media-import-expired-failure-reasons';
import { completeCallRecordingImport } from 'src/logic-functions/data/complete-call-recording-import.util';
import { type CallRecordingForArtifactsImport } from 'src/logic-functions/data/find-call-recording-for-artifacts-import.util';
import { updateCallRecording } from 'src/logic-functions/data/update-call-recording.util';
import { updateNonTerminalCallRecordingState } from 'src/logic-functions/data/update-non-terminal-call-recording-state.util';
import { buildEmptyTranscriptMarker } from 'src/logic-functions/domain/build-empty-transcript-marker.util';
import { isCallRecordingImportComplete } from 'src/logic-functions/domain/is-call-recording-import-complete.util';
import { parseTranscriptMarker } from 'src/logic-functions/domain/parse-transcript-marker.util';
import { runCallRecordingArtifactImportWithClaim } from 'src/logic-functions/flows/run-call-recording-artifact-import-with-claim.util';
import { type CallRecordingUpdateFields } from 'src/logic-functions/types/call-recording-update-fields.type';
import { isNonEmptyString } from 'src/logic-functions/utils/is-non-empty-string.util';

export type SettleStuckCallRecordingOutcome =
  | 'completed'
  | 'failed'
  | 'skipped';

type StuckCallRecording = Pick<
  CallRecordingForArtifactsImport,
  | 'id'
  | 'status'
  | 'transcript'
  | 'audio'
  | 'video'
  | 'callRecorderFailureReason'
>;

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
  callRecording: StuckCallRecording,
): Promise<SettleStuckCallRecordingOutcome> => {
  if (callRecording.status !== CallRecordingStatus.PROCESSING) {
    return 'skipped';
  }

  if (
    !isNonEmptyArray(callRecording.audio) &&
    !isNonEmptyArray(callRecording.video)
  ) {
    await updateNonTerminalCallRecordingState(client, {
      callRecordingId: callRecording.id,
      data: {
        status: CallRecordingStatus.FAILED,
        callRecorderFailureReason: RECORDING_IMPORT_EXPIRED_FAILURE_REASON,
      },
    });

    return 'failed';
  }

  const settledFields = buildSettledArtifactFields(callRecording);

  if (Object.keys(settledFields).length > 0) {
    await updateCallRecording(client, {
      id: callRecording.id,
      data: settledFields,
    });
  }

  const isImportComplete = isCallRecordingImportComplete({
    transcript: settledFields.transcript ?? callRecording.transcript,
    audio: callRecording.audio,
    video: callRecording.video,
    callRecorderFailureReason:
      settledFields.callRecorderFailureReason ??
      callRecording.callRecorderFailureReason,
  });

  if (!isImportComplete) {
    return 'skipped';
  }

  await completeCallRecordingImport(client, { id: callRecording.id });

  return 'completed';
};

const buildSettledArtifactFields = (
  callRecording: StuckCallRecording,
): CallRecordingUpdateFields => {
  const transcriptMarker = parseTranscriptMarker(callRecording.transcript);
  const isTranscriptMissing =
    isUndefined(callRecording.transcript) ||
    transcriptMarker?.status === 'PENDING';
  const expiredMediaFailureReasons = [
    ...(isNonEmptyArray(callRecording.audio)
      ? []
      : [AUDIO_IMPORT_EXPIRED_FAILURE_REASON]),
    ...(isNonEmptyArray(callRecording.video)
      ? []
      : [VIDEO_IMPORT_EXPIRED_FAILURE_REASON]),
  ];

  return {
    ...(isTranscriptMissing
      ? {
          transcript: buildEmptyTranscriptMarker({
            recallTranscriptId: transcriptMarker?.recallTranscriptId ?? null,
          }),
        }
      : {}),
    ...(expiredMediaFailureReasons.length === 0
      ? {}
      : {
          callRecorderFailureReason: [
            callRecording.callRecorderFailureReason,
            ...expiredMediaFailureReasons,
          ]
            .filter(isNonEmptyString)
            .join(','),
        }),
  };
};
