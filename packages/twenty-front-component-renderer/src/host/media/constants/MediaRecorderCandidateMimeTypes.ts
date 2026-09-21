// isTypeSupported answers in the worker come from a snapshot, so the host
// probes a list of the container/codec combinations applications actually
// ask for. Anything outside the list reports as unsupported.
export const MEDIA_RECORDER_CANDIDATE_MIME_TYPES = [
  'audio/webm',
  'audio/webm;codecs=opus',
  'audio/mp4',
  'audio/mp4;codecs=mp4a.40.2',
  'audio/ogg',
  'audio/ogg;codecs=opus',
  'video/webm',
  'video/webm;codecs=vp8',
  'video/webm;codecs=vp9',
  'video/webm;codecs=vp8,opus',
  'video/webm;codecs=vp9,opus',
  'video/webm;codecs=h264',
  'video/mp4',
  'video/mp4;codecs=h264',
  'video/x-matroska;codecs=avc1',
];
