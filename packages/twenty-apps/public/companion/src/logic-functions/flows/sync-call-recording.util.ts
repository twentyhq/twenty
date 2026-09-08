import { isDesktopAudioRecording } from 'src/logic-functions/domain/is-desktop-audio-recording.util';
import { isNonEmptyArray, isUndefined } from '@sniptt/guards';
import { type CoreApiClient } from 'twenty-client-sdk/core';

import { isUnavailableCallRecordingStatus } from 'src/logic-functions/domain/is-unavailable-call-recording-status.util';
import { shouldCompleteCallRecordingImport } from 'src/logic-functions/domain/should-complete-call-recording-import.util';
import { importCallRecordingMedia } from 'src/logic-functions/flows/import-call-recording-media.util';
import { persistCallRecordingProgress } from 'src/logic-functions/flows/persist-call-recording-progress.util';
import { importCallRecordingTranscript } from 'src/logic-functions/flows/import-call-recording-transcript.util';
import { type CallRecordingUpdateFields } from 'src/logic-functions/types/call-recording-update-fields.type';
import { type FilesFieldValue } from 'src/logic-functions/types/files-field-value.type';

export type SyncableCallRecording = {
  companionSession?: unknown;
  id: string;
  status: string | undefined;
  startedAt: string | undefined;
  endedAt: string | undefined;
  externalRecordingId: string | undefined;
  companionFailureReason: string | undefined;
  transcript: unknown;
  audio: FilesFieldValue | undefined;
  video: FilesFieldValue | undefined;
};

export type SyncCallRecordingResult = {
  updated: boolean;
  requestedTranscript: boolean;
};

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

  delete scrubbedUpdate.companionFailureReason;

  return scrubbedUpdate;
};
