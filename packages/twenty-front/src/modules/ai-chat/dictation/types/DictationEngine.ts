import { type DictationEngineListener } from '@/ai-chat/dictation/types/DictationEngineListener';

export type DictationEngine = {
  start: () => Promise<void>;
  stop: () => void;
  cancel: () => void;
  dispose: () => void;
  subscribe: (listener: DictationEngineListener) => () => void;
};
