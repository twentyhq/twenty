export type DictationFailureReason =
  | 'permission-denied'
  | 'no-device'
  | 'unsupported-surface'
  // iOS exposes webkitSpeechRecognition in contexts where it never emits, so
  // feature detection reports success while dictation does nothing.
  | 'engine-silent'
  | 'network'
  | 'engine-error';

export type DictationEngineState = 'idle' | 'recording';

export type DictationEngineEvent =
  | { type: 'interim'; text: string }
  | { type: 'final'; text: string }
  | { type: 'state'; state: DictationEngineState }
  | { type: 'error'; reason: DictationFailureReason };

export type DictationEngineListener = (event: DictationEngineEvent) => void;

export type DictationEngine = {
  start: () => Promise<void>;
  stop: () => void;
  cancel: () => void;
  dispose: () => void;
  subscribe: (listener: DictationEngineListener) => () => void;
};
