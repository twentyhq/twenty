export type DictationFailureReason =
  | 'permission-denied'
  | 'no-device'
  | 'unsupported-surface'
  // iOS exposes webkitSpeechRecognition in contexts where it never emits, so
  // feature detection reports success while dictation does nothing.
  | 'engine-silent'
  | 'network'
  | 'engine-error';
