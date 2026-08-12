import { type CaptureMediaMediaType } from 'twenty-front-component-renderer';

// Ordered by preference: opus-in-webm is the best supported recording format
// in Chromium and Firefox; mp4 covers Safari, which records AAC natively.
const AUDIO_MIME_TYPE_PREFERENCES = [
  'audio/webm;codecs=opus',
  'audio/webm',
  'audio/mp4;codecs=mp4a.40.2',
  'audio/mp4',
  'audio/ogg;codecs=opus',
];

const VIDEO_MIME_TYPE_PREFERENCES = [
  'video/webm;codecs=vp9,opus',
  'video/webm;codecs=vp8,opus',
  'video/webm',
  'video/mp4',
];

export const pickSupportedMediaRecorderMimeType = ({
  mediaType,
  isMimeTypeSupported,
}: {
  mediaType: CaptureMediaMediaType;
  isMimeTypeSupported: (mimeType: string) => boolean;
}): string | undefined => {
  const mimeTypePreferences =
    mediaType === 'audio'
      ? AUDIO_MIME_TYPE_PREFERENCES
      : VIDEO_MIME_TYPE_PREFERENCES;

  return mimeTypePreferences.find((mimeType) => isMimeTypeSupported(mimeType));
};
