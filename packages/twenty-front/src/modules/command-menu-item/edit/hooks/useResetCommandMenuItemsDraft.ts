import { useCallback } from 'react';
import { useStore } from 'jotai';

import { commandMenuItemsDraftState } from '@/command-menu-item/edit/states/commandMenuItemsDraftState';
import { commandMenuItemsSelector } from '@/command-menu-item/states/commandMenuItemsSelector';

// Resets the draft to the current server state, discarding all user edits.
export const useResetCommandMenuItemsDraft = () => {
  const store = useStore();

  const resetCommandMenuItemsDraft = useCallback(() => {
    const serverItems = store.get(commandMenuItemsSelector.atom);

    store.set(
      commandMenuItemsDraftState.atom,
      serverItems.map((item) => ({ ...item })),
    );
  }, [store]);

  return { resetCommandMenuItemsDraft };
};
