import { useCallback } from 'react';

import {
  type HeadlessFrontComponentMountContext,
  mountedHeadlessFrontComponentMapsState,
} from '@/front-components/states/mountedHeadlessFrontComponentMapsState';
import { useStore } from 'jotai';

export const useMountHeadlessFrontComponent = () => {
  const store = useStore();
  const mountHeadlessFrontComponent = useCallback(
    (
      frontComponentId: string,
      context?: HeadlessFrontComponentMountContext,
    ) => {
      store.set(mountedHeadlessFrontComponentMapsState.atom, (previousMap) => {
        const next = new Map(previousMap);
        next.set(frontComponentId, context ?? undefined);
        return next;
      });
    },
    [store],
  );

  return mountHeadlessFrontComponent;
};
