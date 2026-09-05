import { isDefined } from 'src/utils/is-defined';

import { type CallRecordingSyncFields } from 'src/logic-functions/types/call-recording-sync-fields.type';
import { type CallRecordingMediaState } from 'src/logic-functions/types/call-recording-media-state.type';

export const buildFathomCallRecordingUpsertFields = ({
  sharedFields,
  existingCallRecording,
  connectedAccountId,
  retryMedia,
}: {
  sharedFields: CallRecordingSyncFields;
  existingCallRecording:
    | Pick<
        CallRecordingMediaState,
        | 'hasVideo'
        | 'hasAudio'
        | 'failureReason'
        | 'downloadId'
        | 'connectedAccountId'
        | 'hasTranscript'
        | 'hasSummary'
      >
    | undefined;
  connectedAccountId: string;
  retryMedia: boolean;
}): {
  createFields: CallRecordingSyncFields;
  updateFields: CallRecordingSyncFields;
  isMediaDownloadRequestNeeded: boolean;
} => {
  const isRetryingSettledMedia =
    retryMedia &&
    isDefined(existingCallRecording?.failureReason) &&
    !existingCallRecording.hasVideo &&
    !existingCallRecording.hasAudio;
  const hasActiveDownloadForCurrentConnection =
    !isRetryingSettledMedia &&
    isDefined(existingCallRecording?.downloadId) &&
    existingCallRecording.connectedAccountId === connectedAccountId;
  const isReplacingActiveDownload =
    isDefined(existingCallRecording) &&
    existingCallRecording.connectedAccountId !== connectedAccountId &&
    !existingCallRecording.hasVideo &&
    !existingCallRecording.hasAudio &&
    !isDefined(existingCallRecording.failureReason);
  const isMissingMedia =
    !existingCallRecording?.hasVideo &&
    !existingCallRecording?.hasAudio &&
    !isDefined(existingCallRecording?.downloadId) &&
    !isDefined(existingCallRecording?.failureReason);
  const ownershipFields = hasActiveDownloadForCurrentConnection
    ? {}
    : { fathomConnectedAccountId: connectedAccountId };

  return {
    createFields: {
      ...sharedFields,
      ...ownershipFields,
      status: 'PROCESSING',
    },
    updateFields: {
      ...sharedFields,
      ...(existingCallRecording?.hasTranscript
        ? { transcript: undefined }
        : {}),
      ...(existingCallRecording?.hasSummary ? { summary: undefined } : {}),
      ...ownershipFields,
      ...(isReplacingActiveDownload || isRetryingSettledMedia
        ? {
            fathomMediaDownloadId: null,
            fathomMediaUploadCheckpoint: null,
            fathomMediaImportClaimedAt: null,
          }
        : {}),
      ...(isRetryingSettledMedia
        ? {
            status: 'PROCESSING',
            fathomMediaFailureReason: null,
          }
        : {}),
    },
    isMediaDownloadRequestNeeded:
      isRetryingSettledMedia || isReplacingActiveDownload || isMissingMedia,
  };
};
