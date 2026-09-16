import { isDesktopAudioRecording } from 'src/logic-functions/domain/utils/isDesktopAudioRecording';
import { parseTranscriptMarker } from 'src/logic-functions/domain/utils/parseTranscriptMarker';
import { isCallRecordingMediaImportComplete } from 'src/logic-functions/domain/utils/isCallRecordingMediaImportComplete';
import { CallRecordingStatus } from 'src/logic-functions/constants/CallRecordingStatus';
import { isNonEmptyArray, isUndefined } from '@sniptt/guards';
import { type CoreApiClient } from 'twenty-client-sdk/core';
import { isUnavailableCallRecordingStatus } from 'src/logic-functions/domain/utils/isUnavailableCallRecordingStatus';
import { shouldCompleteCallRecordingImport } from 'src/logic-functions/domain/utils/shouldCompleteCallRecordingImport';
import { importCallRecordingMedia } from 'src/logic-functions/flows/utils/importCallRecordingMedia';
import { persistCallRecordingProgress } from 'src/logic-functions/flows/utils/persistCallRecordingProgress';
import { importCallRecordingTranscript } from 'src/logic-functions/flows/utils/importCallRecordingTranscript';
import { type CallRecordingUpdateFields } from 'src/logic-functions/types/CallRecordingUpdateFields';
import { type SyncableCallRecording } from 'src/logic-functions/types/SyncableCallRecording';
import { type SyncCallRecordingResult } from 'src/logic-functions/types/SyncCallRecordingResult';

export const syncCallRecording = async ({
  client,
  callRecording,
  requestedAt,
}: {
  client: CoreApiClient;
  callRecording: SyncableCallRecording;
  requestedAt: string;
}): Promise<SyncCallRecordingResult> => {
  const externalRecordingId = callRecording.externalRecordingId;
  let updateData: CallRecordingUpdateFields = {};

  let requestedTranscript = false;

  if (!isUndefined(externalRecordingId)) {
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
      hasVideo:
        isDesktopAudioRecording(callRecording.companionSession) ||
        isNonEmptyArray(callRecording.video),
    });

    updateData = {
      ...updateData,
      ...resolveMediaImportUpdate({
        mediaImportUpdate,
        currentStatus: callRecording.status,
        pendingStatus: updateData.status,
        transcriptFailureReason: updateData.companionFailureReason,
      }),
    };
  }

  if (
    parseTranscriptMarker(updateData.transcript ?? callRecording.transcript)
      ?.status === 'FAILED' &&
    isCallRecordingMediaImportComplete({
      requiresVideo: !isDesktopAudioRecording(callRecording.companionSession),
      audio: updateData.audio ?? callRecording.audio,
      video: updateData.video ?? callRecording.video,
      companionFailureReason:
        updateData.companionFailureReason ??
        callRecording.companionFailureReason,
    })
  )
    updateData.status = CallRecordingStatus.FAILED;

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

// Preserve both failures so oversized media does not prevent terminal status.
const resolveMediaImportUpdate = ({
  mediaImportUpdate,
  currentStatus,
  pendingStatus,
  transcriptFailureReason,
}: {
  mediaImportUpdate: CallRecordingUpdateFields;
  currentStatus: string | undefined;
  pendingStatus: string | undefined;
  transcriptFailureReason: string | null | undefined;
}): CallRecordingUpdateFields => {
  const hasNoRecording =
    isUnavailableCallRecordingStatus(currentStatus) ||
    isUnavailableCallRecordingStatus(pendingStatus);

  if (!hasNoRecording && !transcriptFailureReason) {
    return mediaImportUpdate;
  }

  if (transcriptFailureReason && mediaImportUpdate.companionFailureReason) {
    return {
      ...mediaImportUpdate,
      companionFailureReason: `${transcriptFailureReason},${mediaImportUpdate.companionFailureReason}`,
    };
  }

  const { companionFailureReason: _failureReason, ...scrubbedUpdate } =
    mediaImportUpdate;

  return scrubbedUpdate;
};
