import { DICTATION_RECORDER_MIME_TYPES } from '@/ai/dictation/constants/DictationRecorderMimeTypes';

// Returning undefined is a valid answer: MediaRecorder then picks its own
// default, which is what older Safari needs since it supports recording
// without reporting support through isTypeSupported.
export const pickRecorderMimeType = (): string | undefined => {
  if (typeof MediaRecorder?.isTypeSupported !== 'function') {
    return undefined;
  }

  return DICTATION_RECORDER_MIME_TYPES.find((mimeType) =>
    MediaRecorder.isTypeSupported(mimeType),
  );
};
