import { useCallback } from 'react';

import { DEBUG_FOCUS_STACK } from '@/ui/utilities/focus/constants/DebugFocusStack';
import { focusStackState } from '@/ui/utilities/focus/states/focusStackState';
import { FocusComponentType } from '@/ui/utilities/focus/types/FocusComponentType';
import { type FocusStackItem } from '@/ui/utilities/focus/types/FocusStackItem';
import { useStore } from 'jotai';
import { logDebug } from '~/utils/logDebug';

export const useResetFocusStackToFocusItem = () => {
  const store = useStore();

  const resetFocusStackToFocusItem = useCallback(
    ({
      focusStackItem,
      shouldKeepItemsAbovePage = false,
    }: {
      focusStackItem: FocusStackItem;
      shouldKeepItemsAbovePage?: boolean;
    }) => {
      const focusStackItemsAbovePage = shouldKeepItemsAbovePage
        ? store
            .get(focusStackState.atom)
            .filter(
              ({ componentInstance }) =>
                componentInstance.componentType !== FocusComponentType.PAGE,
            )
        : [];

      store.set(focusStackState.atom, [
        focusStackItem,
        ...focusStackItemsAbovePage,
      ]);

      if (DEBUG_FOCUS_STACK) {
        logDebug(`DEBUG: reset focus stack to focus item`, {
          focusStackItem,
        });
      }
    },
    [store],
  );

  return { resetFocusStackToFocusItem };
};
