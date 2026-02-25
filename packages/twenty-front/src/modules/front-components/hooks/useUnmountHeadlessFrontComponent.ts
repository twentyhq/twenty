import { useCallback } from 'react';

import { mountedHeadlessFrontComponentIdsState } from '@/front-components/states/mountedHeadlessFrontComponentIdsState';
import { useStore } from 'jotai';

export const useUnmountHeadlessFrontComponent = () => {
  const store = useStore();
  const unmountHeadlessFrontComponent = useCallback(
    (frontComponentId: string) => {
      store.set(mountedHeadlessFrontComponentIdsState.atom, (previousMap) => {
        const next = new Map(previousMap);
        next.delete(frontComponentId);
        return next;
      });
    },
    [store],
  );

  return unmountHeadlessFrontComponent;
};
