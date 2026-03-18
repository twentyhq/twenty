import { useCallback } from 'react';

import { mountedEngineCommandsState } from '@/command-menu-item/engine-command/states/mountedEngineCommandsState';
import { commandMenuItemProgressFamilyState } from '@/command-menu-item/states/commandMenuItemProgressFamilyState';
import { useStore } from 'jotai';

export const useUnmountEngineCommand = () => {
  const store = useStore();

  const unmountEngineCommand = useCallback(
    (engineCommandId: string) => {
      store.set(mountedEngineCommandsState.atom, (previousMap) => {
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

  return unmountEngineCommand;
};
