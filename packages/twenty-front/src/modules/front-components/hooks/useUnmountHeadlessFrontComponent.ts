import { useCallback } from 'react';

import { commandMenuItemProgressFamilyState } from '@/command-menu-item/states/commandMenuItemProgressFamilyState';
import { mountedHeadlessFrontComponentMapsState } from '@/front-components/states/mountedHeadlessFrontComponentMapsState';
import { useStore } from 'jotai';

export const useUnmountHeadlessFrontComponent = () => {
  const store = useStore();
  const unmountHeadlessFrontComponent = useCallback(
    (frontComponentId: string) => {
      const currentMap = store.get(mountedHeadlessFrontComponentMapsState.atom);
      const mountContext = currentMap.get(frontComponentId);

      store.set(mountedHeadlessFrontComponentMapsState.atom, (previousMap) => {
        const next = new Map(previousMap);
        next.delete(frontComponentId);
        return next;
      });

      if (mountContext) {
        store.set(
          commandMenuItemProgressFamilyState.atomFamily(
            mountContext.commandMenuItemId,
          ),
          undefined,
        );
      }
    },
    [store],
  );

  return unmountHeadlessFrontComponent;
};
