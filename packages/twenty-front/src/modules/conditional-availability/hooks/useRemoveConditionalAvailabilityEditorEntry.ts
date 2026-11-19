import { conditionalAvailabilityEditorStatesState } from '@/conditional-availability/states/conditionalAvailabilityEditorStatesState';
import { useStore } from 'jotai';
import { useCallback } from 'react';

export const useRemoveConditionalAvailabilityEditorEntry = () => {
  const store = useStore();

  const removeConditionalAvailabilityEditorEntry = useCallback(
    (itemKey: string) => {
      store.set(
        conditionalAvailabilityEditorStatesState.atom,
        (previousEditorStates) =>
          Object.fromEntries(
            Object.entries(previousEditorStates).filter(
              ([entryItemKey]) => entryItemKey !== itemKey,
            ),
          ),
      );
    },
    [store],
  );

  return { removeConditionalAvailabilityEditorEntry };
};
