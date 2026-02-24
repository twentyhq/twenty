import { useCallback } from 'react';

import { mountedHeadlessFrontComponentIdsState } from '@/front-components/states/mountedHeadlessFrontComponentIdsState';
import { useStore } from 'jotai';

export const useMountHeadlessFrontComponent = () => {
  const store = useStore();
  const mountHeadlessFrontComponent = useCallback(
    (frontComponentId: string) => {
      store.set(mountedHeadlessFrontComponentIdsState.atom, (previousIds) =>
        new Set(previousIds).add(frontComponentId),
      );
    },
    [store],
  );

  return mountHeadlessFrontComponent;
};
