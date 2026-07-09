import { isNonEmptyArray, isUndefined } from '@sniptt/guards';
import { type CoreApiClient } from 'twenty-client-sdk/core';

import { CallRecordingStatus } from 'src/logic-functions/constants/call-recording-status';
import { isCallRecordingStatusDowngrade } from 'src/logic-functions/domain/is-call-recording-status-downgrade.util';
import { shouldCompleteCallRecordingIngestion } from 'src/logic-functions/domain/should-complete-call-recording-ingestion.util';
import { ingestCallRecordingMedia } from 'src/logic-functions/flows/ingest-call-recording-media.util';
import { persistCallRecordingProgress } from 'src/logic-functions/flows/persist-call-recording-progress.util';
import { reconcileCallRecordingTranscriptArtifact } from 'src/logic-functions/flows/reconcile-call-recording-transcript-artifact.util';
import {
  extractRecallBotConvergence,
  type RecallBotConvergence,
} from 'src/logic-functions/recall-api/extract-recall-bot-convergence.util';
import { type CallRecordingUpdateFields } from 'src/logic-functions/types/call-recording-update-fields.type';
import { type FilesFieldValue } from 'src/logic-functions/types/files-field-value.type';

export type ReconcilableCallRecording = {
  id: string;
  status: string | undefined;
  startedAt: string | undefined;
  endedAt: string | undefined;
  externalRecordingId: string | undefined;
  callRecorderFailureReason: string | undefined;
  transcript: unknown;
  audio: FilesFieldValue | undefined;
  video: FilesFieldValue | undefined;
};

export type ReconcileCallRecordingResult = {
  updated: boolean;
  requestedTranscript: boolean;
};

// The one per-recording healing brain: the webhook continuation and the
// divergence sweep both funnel here so their reconciliation rules cannot drift.
// Trusts only the local row and the passed bot snapshot, never caller payloads.
export const reconcileCallRecording = async ({
  client,
  callRecording,
  bot,
  treatRecordingAsDone,
  requestedAt,
}: {
  client: CoreApiClient;
  callRecording: ReconcilableCallRecording;
  bot: Record<string, unknown> | undefined;
  // The webhook continuation fires only on recording-done signals, so doneness
  // need not be re-derived from a bot snapshot it may not have.
  treatRecordingAsDone: boolean;
  requestedAt: string;
}): Promise<ReconcileCallRecordingResult> => {
  const convergence = isUndefined(bot)
    ? undefined
    : extractRecallBotConvergence(bot);
  const externalRecordingId =
    callRecording.externalRecordingId ?? convergence?.externalRecordingId;
  const isRecordingDone =
    treatRecordingAsDone || convergence?.isRecallRecordingDone === true;

  let updateData: CallRecordingUpdateFields = isUndefined(convergence)
    ? {}
    : buildConvergenceFieldUpdates({ callRecording, convergence });

  if (
    convergence?.isRecallRecordingDone === true &&
    isUndefined(externalRecordingId)
  ) {
    updateData = {
      ...updateData,
      ...buildMissingArtifactsFailureUpdate({
        currentStatus: callRecording.status,
        pendingStatus: updateData.status,
      }),
    };
  }

  let requestedTranscript = false;

  if (isRecordingDone && !isUndefined(externalRecordingId)) {
    const transcriptArtifactResult =
      await reconcileCallRecordingTranscriptArtifact({
        callRecordingId: callRecording.id,
        currentStatus: callRecording.status,
        externalRecordingId,
        requestedAt,
        transcript: callRecording.transcript,
      });

    requestedTranscript = transcriptArtifactResult.requestedTranscript;
    updateData = { ...updateData, ...transcriptArtifactResult.updateData };

    const mediaIngestionUpdate = await ingestCallRecordingMedia({
      callRecordingId: callRecording.id,
      externalRecordingId,
      hasAudio: isNonEmptyArray(callRecording.audio),
      hasVideo: isNonEmptyArray(callRecording.video),
    });

    updateData = {
      ...updateData,
      ...resolveMediaIngestionUpdate({
        mediaIngestionUpdate,
        currentStatus: callRecording.status,
        pendingStatus: updateData.status,
      }),
    };
  }

  const completesIngestion = shouldCompleteCallRecordingIngestion({
    current: callRecording,
    updateData,
  });

  if (Object.keys(updateData).length === 0 && !completesIngestion) {
    return { updated: false, requestedTranscript };
  }

  await persistCallRecordingProgress(client, {
    id: callRecording.id,
    current: callRecording,
    updateData,
  });

  return { updated: true, requestedTranscript };
};

const buildConvergenceFieldUpdates = ({
  callRecording,
  convergence,
}: {
  callRecording: ReconcilableCallRecording;
  convergence: RecallBotConvergence;
}): CallRecordingUpdateFields => {
  const updateData: CallRecordingUpdateFields = {};

  if (
    !isUndefined(convergence.status) &&
    convergence.status !== callRecording.status &&
    !isCallRecordingStatusDowngrade({
      fromStatus: callRecording.status,
      toStatus: convergence.status,
    })
  ) {
    updateData.status = convergence.status;

    if (convergence.status === CallRecordingStatus.FAILED) {
      updateData.callRecorderFailureReason =
        convergence.failureReason ?? 'recall_bot_failed';
    }
  }

  if (
    isUndefined(callRecording.startedAt) &&
    !isUndefined(convergence.startedAt)
  ) {
    updateData.startedAt = convergence.startedAt;
  }

  if (isUndefined(callRecording.endedAt) && !isUndefined(convergence.endedAt)) {
    updateData.endedAt = convergence.endedAt;
  }

  if (
    isUndefined(callRecording.externalRecordingId) &&
    !isUndefined(convergence.externalRecordingId)
  ) {
    updateData.externalRecordingId = convergence.externalRecordingId;
  }

  return updateData;
};

// The bot completed without ever recording; FAILED rather than COMPLETED because completion bills.
const buildMissingArtifactsFailureUpdate = ({
  currentStatus,
  pendingStatus,
}: {
  currentStatus: string | undefined;
  pendingStatus: string | undefined;
}): CallRecordingUpdateFields => {
  if (
    pendingStatus === CallRecordingStatus.FAILED ||
    isCallRecordingStatusDowngrade({
      fromStatus: currentStatus,
      toStatus: CallRecordingStatus.FAILED,
    })
  ) {
    return {};
  }

  return {
    status: CallRecordingStatus.FAILED,
    callRecorderFailureReason: 'recording_artifacts_unavailable',
  };
};

// A media size marker must not overwrite the failure reason of a FAILED recording.
const resolveMediaIngestionUpdate = ({
  mediaIngestionUpdate,
  currentStatus,
  pendingStatus,
}: {
  mediaIngestionUpdate: CallRecordingUpdateFields;
  currentStatus: string | undefined;
  pendingStatus: string | undefined;
}): CallRecordingUpdateFields => {
  const isRecordingFailed =
    currentStatus === CallRecordingStatus.FAILED ||
    pendingStatus === CallRecordingStatus.FAILED;

  if (!isRecordingFailed) {
    return mediaIngestionUpdate;
  }

  const scrubbedUpdate = { ...mediaIngestionUpdate };

  delete scrubbedUpdate.callRecorderFailureReason;

  return scrubbedUpdate;
};
