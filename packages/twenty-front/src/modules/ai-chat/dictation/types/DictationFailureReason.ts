export type DictationFailureReason =
  | 'permission-denied'
  | 'no-device'
  | 'unsupported-surface'
  // iOS exposes webkitSpeechRecognition where it never emits, so feature detection passes.
  | 'engine-silent'
  | 'network'
  | 'engine-error';
