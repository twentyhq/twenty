import { type DictationEngineState } from '@/ai-chat/dictation/types/DictationEngineState';
import { type DictationFailureReason } from '@/ai-chat/dictation/types/DictationFailureReason';

export type DictationEngineEvent =
  | { type: 'interim'; text: string }
  | { type: 'final'; text: string }
  | { type: 'state'; state: DictationEngineState }
  | { type: 'error'; reason: DictationFailureReason };
