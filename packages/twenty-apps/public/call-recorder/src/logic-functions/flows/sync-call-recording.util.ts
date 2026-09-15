import { isNonEmptyArray, isUndefined } from '@sniptt/guards';
import { type CoreApiClient } from 'twenty-client-sdk/core';

import { CallRecordingStatus } from 'src/logic-functions/constants/call-recording-status';
import { buildExpiredMediaImportUpdate } from 'src/logic-functions/domain/build-expired-media-import-update.util';
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
  mediaExpiresAt: string | undefined;
  transcript: unknown;
  audio: FilesFieldValue | undefined;
  video: FilesFieldValue | undefined;
};

export type SyncCallRecordingResult = {
  updated: boolean;
  requestedTranscript: boolean;
  hasRetryableArtifactFailure: boolean;
};

type ArtifactImportResult = {
  updateData: CallRecordingUpdateFields;
  requestedTranscript: boolean;
  hasRetryableFailure: boolean;
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
  now,
}: {
  client: CoreApiClient;
  callRecording: SyncableCallRecording;
  bot: RecallBotSnapshot | undefined;
  // Webhook-driven imports run only for recording-done signals, so completion
  // need not be re-derived from a bot snapshot they may not have.
  treatRecordingAsDone: boolean;
  requestedAt: string;
  artifactScope: CallRecordingArtifactImportScope;
  now: Date;
}): Promise<SyncCallRecordingResult> => {
  const syncState = isUndefined(bot)
    ? undefined
    : extractRecallBotSyncState(bot);
  const externalRecordingId =
    callRecording.externalRecordingId ?? syncState?.externalRecordingId;
  const isRecordingDone =
    treatRecordingAsDone || syncState?.isRecallRecordingDone === true;
  const mediaExpiresAt =
    callRecording.mediaExpiresAt ?? syncState?.mediaExpiredAt;
  const isMediaExpired =
    !isUndefined(mediaExpiresAt) &&
    new Date(mediaExpiresAt).getTime() <= now.getTime();

  const syncStateUpdate: CallRecordingUpdateFields = isUndefined(syncState)
    ? {}
    : buildSyncStateFieldUpdates({ callRecording, syncState });

  const missingArtifactsFailureUpdate =
    syncState?.isRecallRecordingDone === true &&
    isUndefined(externalRecordingId) &&
    !isMediaExpired &&
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

  const artifactImportResult = isRecordingDone
    ? await importArtifactScope({
        callRecording,
        externalRecordingId,
        requestedAt,
        artifactScope,
        isMediaExpired,
        pendingStatus: syncStateUpdate.status,
      })
    : undefined;

  const updateData: CallRecordingUpdateFields = {
    ...syncStateUpdate,
    ...missingArtifactsFailureUpdate,
    ...(artifactImportResult?.updateData ?? {}),
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
    requestedTranscript: artifactImportResult?.requestedTranscript ?? false,
    hasRetryableArtifactFailure:
      artifactImportResult?.hasRetryableFailure ?? false,
  };
};

const importArtifactScope = async ({
  callRecording,
  externalRecordingId,
  requestedAt,
  artifactScope,
  isMediaExpired,
  pendingStatus,
}: {
  callRecording: SyncableCallRecording;
  externalRecordingId: string | undefined;
  requestedAt: string;
  artifactScope: CallRecordingArtifactImportScope;
  isMediaExpired: boolean;
  pendingStatus: string | undefined;
}): Promise<ArtifactImportResult> => {
  if (artifactScope === 'transcript') {
    return importCallRecordingTranscript({
      callRecordingId: callRecording.id,
      currentStatus: callRecording.status,
      externalRecordingId,
      requestedAt,
      transcript: callRecording.transcript,
      isMediaExpired,
    });
  }

  const mediaImportResult = await importMediaScope({
    callRecording,
    externalRecordingId,
    isMediaExpired,
  });

  return {
    updateData: resolveMediaImportUpdate({
      mediaImportUpdate: dropUnchangedMediaExpiresAt({
        mediaImportUpdate: mediaImportResult.updateData,
        callRecording,
      }),
      currentStatus: callRecording.status,
      pendingStatus,
    }),
    requestedTranscript: false,
    hasRetryableFailure: mediaImportResult.hasRetryableFailure,
  };
};

const importMediaScope = async ({
  callRecording,
  externalRecordingId,
  isMediaExpired,
}: {
  callRecording: SyncableCallRecording;
  externalRecordingId: string | undefined;
  isMediaExpired: boolean;
}): Promise<{
  updateData: CallRecordingUpdateFields;
  hasRetryableFailure: boolean;
}> => {
  // Expired media never comes back, so the recording is settled without a provider read.
  if (isMediaExpired) {
    return {
      updateData: buildExpiredMediaImportUpdate(callRecording),
      hasRetryableFailure: false,
    };
  }

  if (isUndefined(externalRecordingId)) {
    return { updateData: {}, hasRetryableFailure: false };
  }

  return importCallRecordingMedia({
    callRecordingId: callRecording.id,
    externalRecordingId,
    hasAudio: isNonEmptyArray(callRecording.audio),
    hasVideo: isNonEmptyArray(callRecording.video),
  });
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

  if (
    isUndefined(callRecording.mediaExpiresAt) &&
    !isUndefined(syncState.mediaExpiredAt)
  ) {
    updateData.mediaExpiresAt = syncState.mediaExpiredAt;
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

  return isUndefined(transcriptMarker) || transcriptMarker.status !== 'FAILED';
};

const dropUnchangedMediaExpiresAt = ({
  mediaImportUpdate,
  callRecording,
}: {
  mediaImportUpdate: CallRecordingUpdateFields;
  callRecording: SyncableCallRecording;
}): CallRecordingUpdateFields => {
  const { mediaExpiresAt, ...mediaImportUpdateWithoutExpiry } =
    mediaImportUpdate;

  return mediaExpiresAt === callRecording.mediaExpiresAt
    ? mediaImportUpdateWithoutExpiry
    : mediaImportUpdate;
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
