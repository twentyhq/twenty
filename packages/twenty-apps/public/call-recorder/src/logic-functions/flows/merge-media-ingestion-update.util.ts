import { isNonEmptyString, isUndefined } from '@sniptt/guards';

import { type CallRecordingUpdateFields } from 'src/logic-functions/types/call-recording-update-fields.type';

export type MediaIngestionUpdate = Pick<
  CallRecordingUpdateFields,
  'audio' | 'video' | 'callRecorderFailureReason'
>;

// Folds a media-ingestion result into an in-progress update. The size-skip reason is
// only written when nothing more specific (e.g. a transcript failure) already claimed
// callRecorderFailureReason, so a skipped artifact never masks a real failure.
export const mergeMediaIngestionUpdate = (
  target: CallRecordingUpdateFields,
  mediaIngestionUpdate: MediaIngestionUpdate,
): void => {
  if (!isUndefined(mediaIngestionUpdate.audio)) {
    target.audio = mediaIngestionUpdate.audio;
  }

  if (!isUndefined(mediaIngestionUpdate.video)) {
    target.video = mediaIngestionUpdate.video;
  }

  if (
    isNonEmptyString(mediaIngestionUpdate.callRecorderFailureReason) &&
    isUndefined(target.callRecorderFailureReason)
  ) {
    target.callRecorderFailureReason =
      mediaIngestionUpdate.callRecorderFailureReason;
  }
};
