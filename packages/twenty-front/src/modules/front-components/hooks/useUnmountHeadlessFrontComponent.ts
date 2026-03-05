import { useCallback } from 'react';

import { mountedHeadlessFrontComponentMapsState } from '@/front-components/states/mountedHeadlessFrontComponentMapsState';
import { useStore } from 'jotai';

export const useUnmountHeadlessFrontComponent = () => {
  const store = useStore();
  const unmountHeadlessFrontComponent = useCallback(
    (frontComponentId: string) => {
      store.set(mountedHeadlessFrontComponentMapsState.atom, (previousMap) => {
        const next = new Map(previousMap);
        next.delete(frontComponentId);
        return next;
      });
    },
    [store],
  );

  return unmountHeadlessFrontComponent;
};
