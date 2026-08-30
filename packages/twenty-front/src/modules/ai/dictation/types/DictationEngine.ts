import { type DictationMode } from 'twenty-shared/ai';

export type DictationTier = Exclude<DictationMode, 'disabled'>;

export type DictationFailureReason =
  | 'permission-denied'
  | 'no-device'
  | 'unsupported-surface'
  // Started cleanly and then said nothing at all. iOS exposes
  // webkitSpeechRecognition in contexts where it never emits, so feature
  // detection reports success while dictation silently does nothing.
  | 'engine-silent'
  | 'network'
  | 'quota-exhausted'
  | 'engine-error';

export type DictationEngineState =
  | 'idle'
  | 'starting'
  | 'listening'
  | 'settling';

export type DictationEngineEvent =
  | { type: 'interim'; text: string }
  | { type: 'final'; text: string }
  | { type: 'state'; state: DictationEngineState }
  | { type: 'error'; reason: DictationFailureReason };

export type DictationEngineListener = (event: DictationEngineEvent) => void;

export type DictationEngine = {
  readonly tier: DictationTier;
  start: () => Promise<void>;
  stop: () => void;
  dispose: () => void;
  subscribe: (listener: DictationEngineListener) => () => void;
};
