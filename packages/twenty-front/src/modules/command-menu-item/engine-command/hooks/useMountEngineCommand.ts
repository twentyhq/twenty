import { useCallback } from 'react';

import {
  type MountedEngineCommandContext,
  mountedEngineCommandsState,
} from '@/command-menu-item/engine-command/states/mountedEngineCommandsState';
import { useStore } from 'jotai';

export const useMountEngineCommand = () => {
  const store = useStore();

  const mountEngineCommand = useCallback(
    (engineCommandId: string, context: MountedEngineCommandContext) => {
      store.set(mountedEngineCommandsState.atom, (previousMap) => {
        const newMap = new Map(previousMap);

        newMap.set(engineCommandId, context);

        return newMap;
      });
    },
    [store],
  );

  return mountEngineCommand;
};
