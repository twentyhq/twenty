import { isNonEmptyArray, isUndefined } from '@sniptt/guards';
import { type CoreApiClient } from 'twenty-client-sdk/core';

import { CallRecordingStatus } from 'src/logic-functions/constants/call-recording-status';
import { isCallRecordingStatusDowngrade } from 'src/logic-functions/domain/is-call-recording-status-downgrade.util';
import { isUnavailableCallRecordingStatus } from 'src/logic-functions/domain/is-unavailable-call-recording-status.util';
import { parseTranscriptMarker } from 'src/logic-functions/domain/parse-transcript-marker.util';
import { updateCallRecording } from 'src/logic-functions/data/update-call-recording.util';
import { updateNonTerminalCallRecordingState } from 'src/logic-functions/data/update-non-terminal-call-recording-state.util';
import { importCallRecordingMedia } from 'src/logic-functions/flows/import-call-recording-media.util';
import { importCallRecordingTranscript } from 'src/logic-functions/flows/import-call-recording-transcript.util';
import {
  extractRecallBotSyncState,
  type RecallBotSyncState,
} from 'src/logic-functions/recall-api/extract-recall-bot-sync-state.util';
import { type RecallBotSnapshot } from 'src/logic-functions/recall-api/recall-bot-snapshot.type';
import { type CallRecordingArtifactImportScope } from 'src/logic-functions/types/call-recording-artifact-scope.type';
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
  hasRetryableArtifactFailure: boolean;
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
  artifactScope,
}: {
  client: CoreApiClient;
  callRecording: SyncableCallRecording;
  bot: RecallBotSnapshot | undefined;
  // Webhook-driven imports run only for recording-done signals, so completion
  // need not be re-derived from a bot snapshot they may not have.
  treatRecordingAsDone: boolean;
  requestedAt: string;
  artifactScope: CallRecordingArtifactImportScope;
}): Promise<SyncCallRecordingResult> => {
  const syncState = isUndefined(bot)
    ? undefined
    : extractRecallBotSyncState(bot);
  const externalRecordingId =
    callRecording.externalRecordingId ?? syncState?.externalRecordingId;
  const isRecordingDone =
    treatRecordingAsDone || syncState?.isRecallRecordingDone === true;

  const syncStateUpdate: CallRecordingUpdateFields = isUndefined(syncState)
    ? {}
    : buildSyncStateFieldUpdates({ callRecording, syncState });

  const missingArtifactsFailureUpdate =
    syncState?.isRecallRecordingDone === true &&
    isUndefined(externalRecordingId) &&
    !hasRecordingArtifactPath({
      callRecording,
      updateData: syncStateUpdate,
    })
      ? buildMissingArtifactsFailureUpdate({
          currentStatus: callRecording.status,
          pendingStatus: syncStateUpdate.status,
          recallFailureReason: syncState.failureReason,
        })
      : {};

  const transcriptImportResult =
    isRecordingDone &&
    !isUndefined(externalRecordingId) &&
    artifactScope === 'transcript'
      ? await importCallRecordingTranscript({
          callRecordingId: callRecording.id,
          currentStatus: callRecording.status,
          externalRecordingId,
          requestedAt,
          transcript: callRecording.transcript,
        })
      : undefined;

  const mediaImportResult =
    isRecordingDone &&
    !isUndefined(externalRecordingId) &&
    artifactScope === 'media'
      ? await importCallRecordingMedia({
          callRecordingId: callRecording.id,
          externalRecordingId,
          hasAudio: isNonEmptyArray(callRecording.audio),
          hasVideo: isNonEmptyArray(callRecording.video),
        })
      : undefined;

  const mediaImportUpdate = isUndefined(mediaImportResult)
    ? {}
    : resolveMediaImportUpdate({
        mediaImportUpdate: mediaImportResult.updateData,
        currentStatus: callRecording.status,
        pendingStatus: syncStateUpdate.status,
      });

  const updateData: CallRecordingUpdateFields = {
    ...syncStateUpdate,
    ...missingArtifactsFailureUpdate,
    ...(transcriptImportResult?.updateData ?? {}),
    ...mediaImportUpdate,
  };

  const { status, callRecorderFailureReason, ...callRecordingProgressUpdate } =
    updateData;
  const callRecordingStateUpdate: Pick<
    CallRecordingUpdateFields,
    'status' | 'callRecorderFailureReason'
  > = {
    ...(isUndefined(status) ? {} : { status }),
    ...(isUndefined(callRecorderFailureReason)
      ? {}
      : { callRecorderFailureReason }),
  };
  const hasCallRecordingProgressUpdate =
    Object.keys(callRecordingProgressUpdate).length > 0;

  if (hasCallRecordingProgressUpdate) {
    await updateCallRecording(client, {
      id: callRecording.id,
      data: callRecordingProgressUpdate,
    });
  }

  const hasUpdatedCallRecordingState =
    Object.keys(callRecordingStateUpdate).length > 0
      ? await updateNonTerminalCallRecordingState(client, {
          callRecordingId: callRecording.id,
          data: callRecordingStateUpdate,
        })
      : false;

  return {
    updated: hasCallRecordingProgressUpdate || hasUpdatedCallRecordingState,
    requestedTranscript: transcriptImportResult?.requestedTranscript ?? false,
    hasRetryableArtifactFailure:
      transcriptImportResult?.hasRetryableFailure ??
      mediaImportResult?.hasRetryableFailure ??
      false,
  };
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
  const hasNoRecording =
    isUnavailableCallRecordingStatus(currentStatus) ||
    isUnavailableCallRecordingStatus(pendingStatus);

  if (!hasNoRecording) {
    return mediaImportUpdate;
  }

  const scrubbedUpdate = { ...mediaImportUpdate };

  delete scrubbedUpdate.callRecorderFailureReason;

  return scrubbedUpdate;
};
