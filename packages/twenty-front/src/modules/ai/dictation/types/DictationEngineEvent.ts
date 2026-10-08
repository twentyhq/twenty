import { type DictationEngineState } from '@/ai/dictation/types/DictationEngineState';
import { type DictationFailureReason } from '@/ai/dictation/types/DictationFailureReason';

export type DictationEngineEvent =
  | { type: 'interim'; text: string }
  | { type: 'final'; text: string }
  | { type: 'state'; state: DictationEngineState }
  | { type: 'error'; reason: DictationFailureReason };
