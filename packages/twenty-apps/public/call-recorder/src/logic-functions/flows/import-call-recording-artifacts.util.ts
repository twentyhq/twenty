import { isNonEmptyArray, isUndefined } from '@sniptt/guards';
import { type CoreApiClient } from 'twenty-client-sdk/core';

import {
  ARTIFACT_IMPORT_WORK_BUDGET_MS,
  VIDEO_IMPORT_WORK_BUDGET_MS,
} from 'src/logic-functions/constants/artifact-import-work-budget-ms';
import { CallRecordingStatus } from 'src/logic-functions/constants/call-recording-status';
import { RECALL_API_NOT_FOUND_STATUS } from 'src/logic-functions/constants/recall-api-not-found-status';
import { buildCallRecordingSyncUpdate } from 'src/logic-functions/domain/build-call-recording-sync-update.util';
import { buildExpiredMediaImportUpdate } from 'src/logic-functions/domain/build-expired-media-import-update.util';
import { hasCallRecordingUpdateFields } from 'src/logic-functions/domain/has-call-recording-update-fields.util';
import { importCallRecordingMedia } from 'src/logic-functions/flows/import-call-recording-media.util';
import { importCallRecordingTranscript } from 'src/logic-functions/flows/import-call-recording-transcript.util';
import { findCallRecordingForArtifactsImport } from 'src/logic-functions/data/find-call-recording-for-artifacts-import.util';
import { saveCallRecordingImportProgress } from 'src/logic-functions/data/save-call-recording-import-progress.util';
import { settleCallRecordingImport } from 'src/logic-functions/flows/settle-call-recording-import.util';
import { extractRecallBotSyncState } from 'src/logic-functions/recall-api/extract-recall-bot-sync-state.util';
import { getRecallBot } from 'src/logic-functions/recall-api/get-recall-bot.util';
import { type CallRecordingArtifactImportScope } from 'src/logic-functions/types/call-recording-artifact-scope.type';
import { type CallRecordingArtifactsImportRequest } from 'src/logic-functions/types/call-recording-artifacts-import-request.type';
import { type CallRecordingForArtifactsImport } from 'src/logic-functions/types/call-recording-for-artifacts-import.type';
import { type CallRecordingUpdateFields } from 'src/logic-functions/types/call-recording-update-fields.type';

export type ImportCallRecordingArtifactsResult =
  | {
      status: 'imported';
      callRecordingId: string;
      scope: CallRecordingArtifactImportScope;
      outcome: 'call-recording-artifacts-imported';
    }
  | {
      status: 'skipped';
      callRecordingId: string;
      scope: CallRecordingArtifactImportScope;
      reason: string;
    };

type SaveProgress = (data: CallRecordingUpdateFields) => Promise<void>;

type RecallBotSyncResult = {
  externalRecordingId: string | undefined;
  isMediaExpired: boolean;
  updateData: CallRecordingUpdateFields;
};

type ScopeArtifactsImportResult = {
  updateData: CallRecordingUpdateFields;
  hasRetryableFailure: boolean;
};

// Job payloads can carry forged provider ids, so imports resolve only from the
// CallRecording's persisted Recall bot.
export const importCallRecordingArtifacts = async ({
  client,
  request,
  scope,
}: {
  client: CoreApiClient;
  request: CallRecordingArtifactsImportRequest;
  scope: CallRecordingArtifactImportScope;
}): Promise<ImportCallRecordingArtifactsResult> => {
  const signal = AbortSignal.timeout(
    scope === 'video'
      ? VIDEO_IMPORT_WORK_BUDGET_MS
      : ARTIFACT_IMPORT_WORK_BUDGET_MS,
  );
  const callRecording = await findCallRecordingForArtifactsImport(
    client,
    request.callRecordingId,
  );

  if (
    isUndefined(callRecording) ||
    callRecording.status !== CallRecordingStatus.PROCESSING
  ) {
    return {
      status: 'skipped',
      callRecordingId: request.callRecordingId,
      scope,
      reason: 'call recording is not processing',
    };
  }

  const saveProgress: SaveProgress = (data) =>
    saveCallRecordingImportProgress(client, {
      callRecordingId: callRecording.id,
      externalBotId: callRecording.externalBotId,
      data,
    });
  const botSync = await syncRecallBotState({ callRecording, signal });

  await saveProgress(botSync.updateData);

  if (
    !isUndefined(botSync.updateData.status) &&
    botSync.updateData.status !== CallRecordingStatus.PROCESSING
  ) {
    return {
      status: 'skipped',
      callRecordingId: callRecording.id,
      scope,
      reason: 'call recording is not processing',
    };
  }

  const scopeArtifactsImport = await importScopeArtifacts({
    callRecording,
    scope,
    requestedAt: request.requestedAt,
    externalRecordingId: botSync.externalRecordingId,
    isMediaExpired: botSync.isMediaExpired,
    saveProgress,
    signal,
  });

  if (scopeArtifactsImport.hasRetryableFailure) {
    throw new Error(
      `Recall ${scope} artifacts for call recording ${callRecording.id} could not be imported`,
    );
  }

  // A video deadline is a saved terminal outcome; settlement still needs to run.
  const hasSettled = await settleCallRecordingImport(client, {
    callRecordingId: callRecording.id,
  });
  const hasUpdates =
    hasCallRecordingUpdateFields(botSync.updateData) ||
    hasCallRecordingUpdateFields(scopeArtifactsImport.updateData);

  if (!hasUpdates && !hasSettled) {
    return {
      status: 'skipped',
      callRecordingId: callRecording.id,
      scope,
      reason: 'no artifact updates',
    };
  }

  return {
    status: 'imported',
    callRecordingId: callRecording.id,
    scope,
    outcome: 'call-recording-artifacts-imported',
  };
};

// One GET /bot fills whatever the webhooks did not deliver; a vanished bot means its media is gone too.
const syncRecallBotState = async ({
  callRecording,
  signal,
}: {
  callRecording: CallRecordingForArtifactsImport;
  signal: AbortSignal;
}): Promise<RecallBotSyncResult> => {
  const hasCompleteBotState =
    !isUndefined(callRecording.externalRecordingId) &&
    !isUndefined(callRecording.startedAt) &&
    !isUndefined(callRecording.endedAt);

  if (hasCompleteBotState || isUndefined(callRecording.externalBotId)) {
    return {
      externalRecordingId: callRecording.externalRecordingId,
      isMediaExpired: false,
      updateData: {},
    };
  }

  const botResult = await getRecallBot({
    externalBotId: callRecording.externalBotId,
    signal,
  });

  if (!botResult.ok) {
    if (botResult.status !== RECALL_API_NOT_FOUND_STATUS) {
      throw new Error(botResult.errorMessage);
    }

    return {
      externalRecordingId: callRecording.externalRecordingId,
      isMediaExpired: true,
      updateData: {},
    };
  }

  const syncState = extractRecallBotSyncState(botResult.bot);

  return {
    externalRecordingId:
      callRecording.externalRecordingId ?? syncState.externalRecordingId,
    isMediaExpired: !isUndefined(syncState.mediaExpiredAt),
    updateData: buildCallRecordingSyncUpdate({ callRecording, syncState }),
  };
};

const importScopeArtifacts = async ({
  callRecording,
  scope,
  requestedAt,
  externalRecordingId,
  isMediaExpired,
  saveProgress,
  signal,
}: {
  callRecording: CallRecordingForArtifactsImport;
  scope: CallRecordingArtifactImportScope;
  requestedAt: string;
  externalRecordingId: string | undefined;
  isMediaExpired: boolean;
  saveProgress: SaveProgress;
  signal: AbortSignal;
}): Promise<ScopeArtifactsImportResult> => {
  if (scope === 'transcript') {
    const transcriptImport = await importCallRecordingTranscript({
      callRecordingId: callRecording.id,
      currentStatus: callRecording.status,
      externalRecordingId,
      requestedAt,
      transcript: callRecording.transcript,
      isMediaExpired,
      signal,
    });

    await saveProgress(transcriptImport.updateData);

    return transcriptImport;
  }

  if (isMediaExpired) {
    const updateData = buildExpiredMediaImportUpdate({
      ...callRecording,
      scope,
    });

    await saveProgress(updateData);

    return { updateData, hasRetryableFailure: false };
  }

  if (isUndefined(externalRecordingId)) {
    return { updateData: {}, hasRetryableFailure: false };
  }

  const mediaImport = await importCallRecordingMedia({
    callRecordingId: callRecording.id,
    externalRecordingId,
    hasAudio: scope === 'video' || isNonEmptyArray(callRecording.audio),
    hasVideo: scope === 'audio' || isNonEmptyArray(callRecording.video),
    callRecorderFailureReason: callRecording.callRecorderFailureReason,
    saveProgress,
    signal,
  });
  const expiredMediaUpdate = mediaImport.isRecordingGone
    ? buildExpiredMediaImportUpdate({ ...callRecording, scope })
    : {};

  await saveProgress(expiredMediaUpdate);

  return {
    updateData: { ...mediaImport.updateData, ...expiredMediaUpdate },
    hasRetryableFailure: mediaImport.hasRetryableFailure,
  };
};
