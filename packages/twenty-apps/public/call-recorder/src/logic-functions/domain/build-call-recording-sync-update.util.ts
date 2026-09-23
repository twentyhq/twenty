import { isNonEmptyArray, isUndefined } from '@sniptt/guards';

import { CallRecordingStatus } from 'src/logic-functions/constants/call-recording-status';
import { type CallRecordingForArtifactsImport } from 'src/logic-functions/types/call-recording-for-artifacts-import.type';
import { isCallRecordingStatusDowngrade } from 'src/logic-functions/domain/is-call-recording-status-downgrade.util';
import { isUnavailableCallRecordingStatus } from 'src/logic-functions/domain/is-unavailable-call-recording-status.util';
import { parseTranscriptMarker } from 'src/logic-functions/domain/parse-transcript-marker.util';
import { type RecallBotSyncState } from 'src/logic-functions/recall-api/extract-recall-bot-sync-state.util';
import { type CallRecordingUpdateFields } from 'src/logic-functions/types/call-recording-update-fields.type';

export const buildCallRecordingSyncUpdate = ({
  callRecording,
  syncState,
}: {
  callRecording: CallRecordingForArtifactsImport;
  syncState: RecallBotSyncState;
}): CallRecordingUpdateFields => {
  const updateData = buildSyncStateFieldUpdates({ callRecording, syncState });
  const externalRecordingId =
    callRecording.externalRecordingId ?? syncState.externalRecordingId;

  if (
    syncState.isRecallRecordingDone &&
    isUndefined(externalRecordingId) &&
    isUndefined(syncState.mediaExpiredAt) &&
    !hasRecordingArtifactPath({ callRecording, updateData })
  ) {
    return {
      ...updateData,
      ...buildMissingArtifactsFailureUpdate({
        currentStatus: callRecording.status,
        pendingStatus: updateData.status,
        recallFailureReason: syncState.failureReason,
      }),
    };
  }

  return updateData;
};

const buildSyncStateFieldUpdates = ({
  callRecording,
  syncState,
}: {
  callRecording: CallRecordingForArtifactsImport;
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

    if (isUnavailableCallRecordingStatus(syncState.status)) {
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

// The bot completed without ever producing a recording, so nothing was captured.
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
    isUnavailableCallRecordingStatus(pendingStatus) ||
    isCallRecordingStatusDowngrade({
      fromStatus: currentStatus,
      toStatus: CallRecordingStatus.NOT_RECORDED,
    })
  ) {
    return {};
  }

  return {
    status: CallRecordingStatus.NOT_RECORDED,
    callRecorderFailureReason:
      recallFailureReason ?? 'recall_bot_did_not_record',
  };
};

const hasRecordingArtifactPath = ({
  callRecording,
  updateData,
}: {
  callRecording: CallRecordingForArtifactsImport;
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

  return isUndefined(transcriptMarker) || transcriptMarker.status !== 'FAILED';
};
