// Ordered by preference. Safari records mp4/AAC and Chrome records webm/opus,
// so both families have to be offered or one of them silently fails to start.
export const DICTATION_RECORDER_MIME_TYPES = [
  'audio/webm;codecs=opus',
  'audio/webm',
  'audio/mp4;codecs=mp4a.40.2',
  'audio/mp4',
  'audio/ogg;codecs=opus',
  'audio/ogg',
];
