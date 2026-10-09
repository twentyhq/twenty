import { useStore } from 'jotai';
import { useCallback } from 'react';
import { isDefined } from 'twenty-shared/utils';

import { shouldFocusNavigationDrawerExpandButtonState } from '@/ui/navigation/navigation-drawer/states/shouldFocusNavigationDrawerExpandButtonState';

export const useNavigationDrawerExpandButtonFocusHandOff = () => {
  const store = useStore();

  return useCallback(
    (expandButton: HTMLButtonElement | null) => {
      if (
        !isDefined(expandButton) ||
        !store.get(shouldFocusNavigationDrawerExpandButtonState.atom)
      ) {
        return;
      }

      store.set(shouldFocusNavigationDrawerExpandButtonState.atom, false);

      const isFocusLost = document.activeElement === document.body;

      if (isFocusLost) {
        expandButton.focus();
      }
    },
    [store],
  );
};
