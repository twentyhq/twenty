import { type DictationEventEmitter } from '@/ai-chat/dictation/types/DictationEventEmitter';
import { type DictationEngineListener } from '@/ai-chat/dictation/types/DictationEngineListener';

export const createDictationEventEmitter = (): DictationEventEmitter => {
  const listeners = new Set<DictationEngineListener>();

  return {
    emit: (event) => {
      const listenersSnapshot = Array.from(listeners);

      for (const listener of listenersSnapshot) {
        listener(event);
      }
    },
    subscribe: (listener) => {
      listeners.add(listener);

      return () => {
        listeners.delete(listener);
      };
    },
    clear: () => {
      listeners.clear();
    },
  };
};
