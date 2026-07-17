import { isNonEmptyArray, isUndefined } from '@sniptt/guards';
import { type CoreApiClient } from 'twenty-client-sdk/core';

import { CallRecordingStatus } from 'src/logic-functions/constants/call-recording-status';
import { isCallRecordingStatusDowngrade } from 'src/logic-functions/domain/is-call-recording-status-downgrade.util';
import { shouldCompleteCallRecordingImport } from 'src/logic-functions/domain/should-complete-call-recording-import.util';
import { parseTranscriptMarker } from 'src/logic-functions/domain/parse-transcript-marker.util';
import { importCallRecordingMedia } from 'src/logic-functions/flows/import-call-recording-media.util';
import { persistCallRecordingProgress } from 'src/logic-functions/flows/persist-call-recording-progress.util';
import { importCallRecordingTranscript } from 'src/logic-functions/flows/import-call-recording-transcript.util';
import {
  extractRecallBotSyncState,
  type RecallBotSyncState,
} from 'src/logic-functions/recall-api/extract-recall-bot-sync-state.util';
import { type RecallBotSnapshot } from 'src/logic-functions/recall-api/recall-bot-snapshot.type';
import { type CallRecordingUpdateFields } from 'src/logic-functions/types/call-recording-update-fields.type';
import { type FilesFieldValue } from 'src/logic-functions/types/files-field-value.type';

export type SyncableCallRecording = {
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

export type SyncCallRecordingResult = {
  updated: boolean;
  requestedTranscript: boolean;
};

// The single-record sync shared by webhook-driven imports and the scheduled
// stale-recording sync. It trusts persisted Twenty data and a parsed Recall bot
// snapshot, never provider ids supplied by a route caller.
export const syncCallRecording = async ({
  client,
  callRecording,
  bot,
  treatRecordingAsDone,
  requestedAt,
}: {
  client: CoreApiClient;
  callRecording: SyncableCallRecording;
  bot: RecallBotSnapshot | undefined;
  // Webhook-driven imports run only for recording-done signals, so completion
  // need not be re-derived from a bot snapshot they may not have.
  treatRecordingAsDone: boolean;
  requestedAt: string;
}): Promise<SyncCallRecordingResult> => {
  const syncState = isUndefined(bot)
    ? undefined
    : extractRecallBotSyncState(bot);
  const externalRecordingId =
    callRecording.externalRecordingId ?? syncState?.externalRecordingId;
  const isRecordingDone =
    treatRecordingAsDone || syncState?.isRecallRecordingDone === true;

  let updateData: CallRecordingUpdateFields = isUndefined(syncState)
    ? {}
    : buildSyncStateFieldUpdates({ callRecording, syncState });

  if (
    syncState?.isRecallRecordingDone === true &&
    isUndefined(externalRecordingId) &&
    !hasRecordingArtifactPath({ callRecording, updateData })
  ) {
    updateData = {
      ...updateData,
      ...buildMissingArtifactsFailureUpdate({
        currentStatus: callRecording.status,
        pendingStatus: updateData.status,
        recallFailureReason: syncState.failureReason,
      }),
    };
  }

  let requestedTranscript = false;

  if (isRecordingDone && !isUndefined(externalRecordingId)) {
    const transcriptImportResult = await importCallRecordingTranscript({
      callRecordingId: callRecording.id,
      currentStatus: callRecording.status,
      externalRecordingId,
      requestedAt,
      transcript: callRecording.transcript,
    });

    requestedTranscript = transcriptImportResult.requestedTranscript;
    updateData = { ...updateData, ...transcriptImportResult.updateData };

    const mediaImportUpdate = await importCallRecordingMedia({
      callRecordingId: callRecording.id,
      externalRecordingId,
      hasAudio: isNonEmptyArray(callRecording.audio),
      hasVideo: isNonEmptyArray(callRecording.video),
    });

    updateData = {
      ...updateData,
      ...resolveMediaImportUpdate({
        mediaImportUpdate,
        currentStatus: callRecording.status,
        pendingStatus: updateData.status,
      }),
    };
  }

  const completesImport = shouldCompleteCallRecordingImport({
    current: callRecording,
    updateData,
  });

  if (Object.keys(updateData).length === 0 && !completesImport) {
    return { updated: false, requestedTranscript };
  }

  await persistCallRecordingProgress(client, {
    id: callRecording.id,
    current: callRecording,
    updateData,
    completesImport,
  });

  return { updated: true, requestedTranscript };
};

const buildSyncStateFieldUpdates = ({
  callRecording,
  syncState,
}: {
  callRecording: SyncableCallRecording;
  syncState: RecallBotSyncState;
}): CallRecordingUpdateFields => {
  const updateData: CallRecordingUpdateFields = {};

  if (
    !isUndefined(syncState.status) &&
    syncState.status !== callRecording.status &&
    !isCallRecordingStatusDowngrade({
      fromStatus: callRecording.status,
      toStatus: syncState.status,
    })
  ) {
    updateData.status = syncState.status;

    if (syncState.status === CallRecordingStatus.FAILED) {
      updateData.callRecorderFailureReason =
        syncState.failureReason ?? 'recall_bot_failed';
    }
  }

  if (
    isUndefined(callRecording.startedAt) &&
    !isUndefined(syncState.startedAt)
  ) {
    updateData.startedAt = syncState.startedAt;
  }

  if (isUndefined(callRecording.endedAt) && !isUndefined(syncState.endedAt)) {
    updateData.endedAt = syncState.endedAt;
  }

  if (
    isUndefined(callRecording.externalRecordingId) &&
    !isUndefined(syncState.externalRecordingId)
  ) {
    updateData.externalRecordingId = syncState.externalRecordingId;
  }

  return updateData;
};

// The bot completed without ever recording; FAILED rather than COMPLETED because completion bills.
const buildMissingArtifactsFailureUpdate = ({
  currentStatus,
  pendingStatus,
  recallFailureReason,
}: {
  currentStatus: string | undefined;
  pendingStatus: string | undefined;
  recallFailureReason: string | undefined;
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
    callRecorderFailureReason:
      recallFailureReason ?? 'recording_artifacts_unavailable',
  };
};

const hasRecordingArtifactPath = ({
  callRecording,
  updateData,
}: {
  callRecording: SyncableCallRecording;
  updateData: CallRecordingUpdateFields;
}): boolean =>
  isNonEmptyArray(updateData.audio ?? callRecording.audio) ||
  isNonEmptyArray(updateData.video ?? callRecording.video) ||
  hasReachableTranscript(updateData.transcript ?? callRecording.transcript);

const hasReachableTranscript = (transcript: unknown): boolean => {
  if (isUndefined(transcript)) {
    return false;
  }

  const transcriptMarker = parseTranscriptMarker(transcript);

  return isUndefined(transcriptMarker) || transcriptMarker.status === 'PENDING';
};

// A media size marker must not overwrite the failure reason of a FAILED recording.
const resolveMediaImportUpdate = ({
  mediaImportUpdate,
  currentStatus,
  pendingStatus,
}: {
  mediaImportUpdate: CallRecordingUpdateFields;
  currentStatus: string | undefined;
  pendingStatus: string | undefined;
}): CallRecordingUpdateFields => {
  const isRecordingFailed =
    currentStatus === CallRecordingStatus.FAILED ||
    pendingStatus === CallRecordingStatus.FAILED;

  if (!isRecordingFailed) {
    return mediaImportUpdate;
  }

  const scrubbedUpdate = { ...mediaImportUpdate };

  delete scrubbedUpdate.callRecorderFailureReason;

  return scrubbedUpdate;
};
