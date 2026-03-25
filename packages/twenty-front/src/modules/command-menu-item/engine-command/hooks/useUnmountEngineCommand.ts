import { useCallback } from 'react';

import { headlessCommandContextApisState } from '@/command-menu-item/engine-command/states/headlessCommandContextApisState';
import { commandMenuItemProgressFamilyState } from '@/command-menu-item/states/commandMenuItemProgressFamilyState';
import { useStore } from 'jotai';

export const useUnmountCommand = () => {
  const store = useStore();

  const unmountCommand = useCallback(
    (engineCommandId: string) => {
      store.set(headlessCommandContextApisState.atom, (previousMap) => {
        const newMap = new Map(previousMap);

        newMap.delete(engineCommandId);

        return newMap;
      });

      store.set(
        commandMenuItemProgressFamilyState.atomFamily(engineCommandId),
        undefined,
      );
    },
    [store],
  );

  return unmountCommand;
};
