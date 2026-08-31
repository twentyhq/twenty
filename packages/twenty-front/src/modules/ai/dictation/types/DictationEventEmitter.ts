import { type DictationEngineEvent } from '@/ai/dictation/types/DictationEngineEvent';
import { type DictationEngineListener } from '@/ai/dictation/types/DictationEngineListener';

export type DictationEventEmitter = {
  subscribe: (listener: DictationEngineListener) => () => void;
  emit: (event: DictationEngineEvent) => void;
  clear: () => void;
};
