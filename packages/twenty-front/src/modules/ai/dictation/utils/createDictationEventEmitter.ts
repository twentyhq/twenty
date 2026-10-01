import { type DictationEventEmitter } from '@/ai/dictation/types/DictationEventEmitter';
import { type DictationEngineListener } from '@/ai/dictation/types/DictationEngineListener';

export const createDictationEventEmitter = (): DictationEventEmitter => {
  const listeners = new Set<DictationEngineListener>();

  return {
    // Iterates a copy so a listener unsubscribing mid-emit can't skip the next one.
    emit: (event) => {
      for (const listener of Array.from(listeners)) {
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
