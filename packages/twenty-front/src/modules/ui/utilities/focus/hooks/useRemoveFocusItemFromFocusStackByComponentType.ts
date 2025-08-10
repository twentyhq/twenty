import { DEBUG_FOCUS_STACK } from '@/ui/utilities/focus/constants/DebugFocusStack';
import { focusStackState } from '@/ui/utilities/focus/states/focusStackState';
import { type FocusComponentType } from '@/ui/utilities/focus/types/FocusComponentType';
import { useRecoilCallback } from 'recoil';
import { logDebug } from '~/utils/logDebug';

export const useRemoveLastFocusItemFromFocusStackByComponentType = () => {
  const removeLastFocusItemFromFocusStackByComponentType = useRecoilCallback(
    ({ snapshot, set }) =>
      ({ componentType }: { componentType: FocusComponentType }) => {
        const focusStack = snapshot.getLoadable(focusStackState).getValue();

        const lastMatchingIndex = focusStack.findLastIndex(
          (focusStackItem) =>
            focusStackItem.componentInstance.componentType === componentType,
        );

        if (lastMatchingIndex === -1) {
          if (DEBUG_FOCUS_STACK) {
            logDebug(
              `DEBUG: removeFocusItemFromFocusStackByComponentType - no item found for type ${componentType}`,
              { focusStack },
            );
          }
          return;
        }

        const removedFocusItem = focusStack[lastMatchingIndex];
        const newFocusStack = focusStack.filter(
          (_, index) => index !== lastMatchingIndex,
        );

        set(focusStackState, newFocusStack);

        if (DEBUG_FOCUS_STACK) {
          logDebug(
            `DEBUG: removeFocusItemFromFocusStackByComponentType ${componentType}`,
            {
              removedFocusItem,
              newFocusStack,
            },
          );
        }
      },
    [],
  );

  return { removeLastFocusItemFromFocusStackByComponentType };
};
