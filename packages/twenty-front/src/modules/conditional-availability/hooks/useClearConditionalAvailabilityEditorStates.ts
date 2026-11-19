import { conditionalAvailabilityEditorStatesState } from '@/conditional-availability/states/conditionalAvailabilityEditorStatesState';
import { useStore } from 'jotai';
import { useCallback } from 'react';

export const useClearConditionalAvailabilityEditorStates = () => {
  const store = useStore();

  const clearConditionalAvailabilityEditorStates = useCallback(() => {
    store.set(conditionalAvailabilityEditorStatesState.atom, {});
  }, [store]);

  return { clearConditionalAvailabilityEditorStates };
};
