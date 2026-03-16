import { useCallback } from 'react';

import { engineCommandExecutionContextComponentState } from '@/command-menu-item/engine-command/states/engineCommandExecutionContextComponentState';
import { mountedEngineCommandsState } from '@/command-menu-item/engine-command/states/mountedEngineCommandsState';
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
        engineCommandExecutionContextComponentState.atomFamily({
          instanceId: engineCommandId,
        }),
        null,
      );
    },
    [store],
  );

  return unmountEngineCommand;
};
