import { type DictationEngineEvent } from '@/ai-chat/dictation/types/DictationEngineEvent';
import { type DictationEngineListener } from '@/ai-chat/dictation/types/DictationEngineListener';

export type DictationEventEmitter = {
  subscribe: (listener: DictationEngineListener) => () => void;
  emit: (event: DictationEngineEvent) => void;
  clear: () => void;
};
